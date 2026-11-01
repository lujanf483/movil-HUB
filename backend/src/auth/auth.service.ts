import { createHash } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/users.repository';
import { User, toPublicUser } from '../users/user.entity';
import { POLICY_VERSION } from '../privacy/privacy.constants';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto, ip: string | null) {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    if (dto.password.toLowerCase() === dto.username.toLowerCase()) {
      throw new BadRequestException('La contraseña no puede ser igual al usuario');
    }
    if (this.users.findByUsername(dto.username)) {
      throw new ConflictException('El usuario ya existe');
    }
    if (this.users.findByEmail(dto.email)) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.users.create({
      username: dto.username,
      usernameLower: dto.username.toLowerCase(),
      email: dto.email,
      passwordHash,
      role: 'user',
      isActive: true,
      consent: {
        accepted: true,
        acceptedAt: new Date().toISOString(),
        policyVersion: POLICY_VERSION,
        ip,
      },
      refreshTokenHash: null,
    });

    const tokens = await this.issueTokens(user);
    return { user: toPublicUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = this.users.findByUsernameOrEmail(dto.identifier);
    const valid =
      user && (await bcrypt.compare(dto.password, user.passwordHash));

    if (!user || !valid || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas o cuenta desactivada');
    }

    const tokens = await this.issueTokens(user);
    return { user: toPublicUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; type: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = this.users.findById(payload.sub);
    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new UnauthorizedException('Sesión no válida');
    }

    if (this.hashToken(refreshToken) !== user.refreshTokenHash) {
      throw new UnauthorizedException('Sesión no válida');
    }

    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.users.update(userId, { refreshTokenHash: null });
    return { message: 'Sesión cerrada' };
  }

  getProfile(userId: string) {
    const user = this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return toPublicUser(user);
  }

  private async issueTokens(user: User) {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, role: user.role, type: 'access' },
      {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.config.getOrThrow<string>('JWT_EXPIRES_IN') as any,
      },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN') as any,
      },
    );

    // bcrypt solo procesa los primeros 72 bytes, por eso se hashea con
    // SHA-256 antes de comparar en lugar de usar el token completo.
    const refreshTokenHash = this.hashToken(refreshToken);
    await this.users.update(user.id, { refreshTokenHash });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
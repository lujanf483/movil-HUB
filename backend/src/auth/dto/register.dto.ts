import { Transform } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3, { message: 'El usuario debe tener al menos 3 caracteres' })
  @MaxLength(80, { message: 'El usuario no puede pasar de 80 caracteres' })
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'El usuario solo puede contener letras, números, guiones y guiones bajos',
  })
  username: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(120, { message: 'Email demasiado largo' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72, { message: 'La contraseña no puede pasar de 72 caracteres' })
  @Matches(/[A-Za-z]/, { message: 'La contraseña debe incluir al menos una letra' })
  @Matches(/[0-9]/, { message: 'La contraseña debe incluir al menos un número' })
  password: string;

  @IsString()
  passwordConfirm: string;

  @IsBoolean({ message: 'Debes indicar si aceptas el aviso de privacidad' })
  @Equals(true, {
    message: 'Debes aceptar el aviso de privacidad para registrarte',
  })
  acceptPrivacy: boolean;
}
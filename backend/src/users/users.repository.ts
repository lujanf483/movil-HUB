import { Injectable } from '@nestjs/common';
import { JsonDbService } from '../database/json-db.service';
import { User } from './user.entity';

const COLLECTION = 'users';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: JsonDbService) {}

  findById(id: string): User | undefined {
    return this.db.findById<User>(COLLECTION, id);
  }

  findByUsername(username: string): User | undefined {
    const value = username.toLowerCase();
    return this.db.findOne<User>(COLLECTION, (u) => u.usernameLower === value);
  }

  findByEmail(email: string): User | undefined {
    const value = email.toLowerCase();
    return this.db.findOne<User>(COLLECTION, (u) => u.email === value);
  }

  findByUsernameOrEmail(value: string): User | undefined {
    const v = value.toLowerCase();
    return this.db.findOne<User>(
      COLLECTION,
      (u) => u.usernameLower === v || u.email === v,
    );
  }

  create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return this.db.insert<User>(COLLECTION, data);
  }

  update(
    id: string,
    patch: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<User | undefined> {
    return this.db.update<User>(COLLECTION, id, patch);
  }
}
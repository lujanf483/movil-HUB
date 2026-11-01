import { BaseRecord } from '../database/json-db.service';

export interface Consent {
  accepted: boolean;
  acceptedAt: string;
  policyVersion: string;
  ip: string | null;
}

export interface User extends BaseRecord {
  username: string;
  usernameLower: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'editor' | 'admin';
  isActive: boolean;
  consent: Consent;
  refreshTokenHash: string | null;
}

export type PublicUser = Omit<User, 'passwordHash' | 'refreshTokenHash' | 'usernameLower'>;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, refreshTokenHash, usernameLower, ...rest } = user;
  return rest;
}
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { dirname, resolve } from 'path';
import { randomUUID } from 'crypto';

export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

type Store = Record<string, BaseRecord[]>;

@Injectable()
export class JsonDbService implements OnModuleInit {
  private readonly logger = new Logger(JsonDbService.name);
  private readonly filePath: string;
  private store: Store = {};
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(private readonly config: ConfigService) {
    this.filePath = resolve(
      process.cwd(),
      this.config.get<string>('DB_JSON_PATH') ?? 'data/db.json',
    );
  }

  async onModuleInit(): Promise<void> {
    await fs.mkdir(dirname(this.filePath), { recursive: true });
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      this.store = raw.trim() ? (JSON.parse(raw) as Store) : {};
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        this.store = {};
        await this.persist();
      } else {
        throw err;
      }
    }
    this.logger.log(`Base JSON lista en ${this.filePath}`);
  }

  findAll<T extends BaseRecord>(collection: string): T[] {
    return [...((this.store[collection] ?? []) as T[])];
  }

  findOne<T extends BaseRecord>(
    collection: string,
    predicate: (item: T) => boolean,
  ): T | undefined {
    return ((this.store[collection] ?? []) as T[]).find(predicate);
  }

  findById<T extends BaseRecord>(collection: string, id: string): T | undefined {
    return this.findOne<T>(collection, (item) => item.id === id);
  }

  async insert<T extends BaseRecord>(
    collection: string,
    data: Omit<T, keyof BaseRecord>,
  ): Promise<T> {
    const now = new Date().toISOString();
    const record = {
      ...data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as T;
    if (!this.store[collection]) this.store[collection] = [];
    this.store[collection].push(record);
    await this.persist();
    return record;
  }

  async update<T extends BaseRecord>(
    collection: string,
    id: string,
    patch: Partial<Omit<T, keyof BaseRecord>>,
  ): Promise<T | undefined> {
    const list = (this.store[collection] ?? []) as T[];
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    list[index] = {
      ...list[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await this.persist();
    return list[index];
  }

  async remove(collection: string, id: string): Promise<boolean> {
    const list = this.store[collection] ?? [];
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    await this.persist();
    return true;
  }

  private persist(): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      const tmp = `${this.filePath}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(this.store, null, 2), 'utf-8');
      await fs.rename(tmp, this.filePath);
    });
    return this.writeQueue;
  }
}
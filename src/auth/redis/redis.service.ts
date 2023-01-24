import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private redisManager: Cache,
  ) {}

  async getKeys(pattern: string): Promise<string[]> {
    return this.redisManager.store.keys(pattern);
  }

  async getValue<T>(key: string): Promise<T | undefined> {
    return this.redisManager.store.get<T>(key);
  }

  async save(key: string, value: any, ttl: number): Promise<void> {
    this.redisManager.store.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    this.redisManager.store.del(key);
  }

  async deleteByKeys(pattern: string): Promise<void> {
    const redisKeys = await this.getKeys(pattern);
    for (const key of redisKeys) {
      await this.delete(key);
    }
  }
}

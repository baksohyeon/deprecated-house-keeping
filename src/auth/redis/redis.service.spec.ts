import { CACHE_MANAGER, ValueProvider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { Cache, Store } from 'cache-manager';
import { PublicPart } from '../test/utils/public-part.type';

describe('RedisService', () => {
  let redisService: RedisService;
  let redisManager: Cache;

  const MockCacheManager: ValueProvider<PublicPart<Cache>> = {
    provide: CACHE_MANAGER,
    useValue: {
      store: {
        get: jest
          .fn()
          .mockImplementation(() => 'value')
          .mockName('store.get'),
        set: jest
          .fn((key: string, value: string, ttl: number) => true)
          .mockName('store.set'),
        del: jest.fn((key: string) => true).mockName('store.del'),
        reset: jest.fn(),
        mset: jest.fn(),
        mget: jest.fn(),
        mdel: jest.fn(),
        keys: jest.fn(),
        ttl: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService, MockCacheManager],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
    redisManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(redisService).toBeDefined();
  });

  describe('get value by key', () => {
    it('should successfully get to redis', () => {
      expect(redisService.getValue('key')).resolves.toBe('value');
    });

    it('should be called with key', async () => {
      await redisService.getValue('hello');
      const redisSpy = jest.spyOn(redisManager.store, 'get');
      expect(redisSpy).toBeCalledWith('hello');
      expect(redisSpy).not.toBeCalledWith('good');
    });
  });

  describe('save', () => {
    it('should be called with key, value, ttl', async () => {
      const redisSpy = jest.spyOn(redisManager.store, 'set');
      await redisService.save('key1', 'value1', 5000);

      expect(redisSpy).toBeCalledWith('key1', 'value1', 5000);
    });

    it('should be excuted', () => {
      expect(redisService.save('key2', 'value2', 5000)).resolves.toBeTruthy();
    });
  });

  describe('delete', () => {
    it('should be called with key', async () => {
      const redisSpy = jest.spyOn(redisManager.store, 'del');
      await redisService.delete('deleteKey');
      expect(redisSpy).toHaveBeenCalledTimes(1);
      expect(redisSpy).toHaveBeenCalledWith('deleteKey');
      expect(redisService.delete('deleteKey')).resolves.toBeTruthy();
    });
  });
});

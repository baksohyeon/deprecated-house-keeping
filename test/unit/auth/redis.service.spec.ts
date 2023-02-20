import { CACHE_MANAGER, ValueProvider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../../../src/module/auth/redis/redis.service';
import { Cache, Store } from 'cache-manager';
import { PublicPart } from '../../../src/util/public-part.type';

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
    jest.clearAllMocks();
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
      await redisService.save('key2', 'value2', 5000);

      expect(redisSpy).toBeCalledWith('key1', 'value1', 5000);
      expect(redisSpy).toBeCalledTimes(2);
      expect(redisSpy).not.toBeCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('have have been called times 5', async () => {
      const redisSpy = jest.spyOn(redisManager.store, 'del');
      redisService.delete('deleteKey1');
      redisService.delete('deleteKey2');
      redisService.delete('deleteKey3');
      redisService.delete('deleteKey4');
      redisService.delete('deleteKey5');
      redisService.delete('six');
      expect(redisSpy).nthCalledWith(1, 'deleteKey1');
      expect(redisSpy).nthCalledWith(2, 'deleteKey2');
      expect(redisSpy).nthCalledWith(3, 'deleteKey3');
      expect(redisSpy).nthCalledWith(4, 'deleteKey4');
      expect(redisSpy).nthCalledWith(5, 'deleteKey5');
      expect(redisSpy).nthCalledWith(6, 'six');
    });

    it('should be called with key', () => {
      const redisSpy = jest.spyOn(redisManager.store, 'del');
      redisService.delete('test');
      expect(redisSpy).toBeCalledWith('test');
    });
  });

  describe('delete by keys', () => {
    it('should define by keys', async () => {
      const redisSpyKeys = jest.spyOn(redisService, 'getKeys');
      const keys: string[] = ['key1', 'key2', 'key3'];
      redisSpyKeys.mockImplementationOnce(() => Promise.resolve(keys));
      const redisSpyDel = jest.spyOn(redisService, 'delete');
      await redisService.deleteByKeys('key');
      expect(redisSpyDel).nthCalledWith(1, 'key1');
      expect(redisSpyDel).nthCalledWith(2, 'key2');
      expect(redisSpyDel).nthCalledWith(3, 'key3');
    });
  });
});

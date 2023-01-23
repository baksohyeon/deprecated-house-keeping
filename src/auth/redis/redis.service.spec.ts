import { RedisService } from './redis.service';
import { Cache } from 'cache-manager';

describe('RedisService', () => {
  let redisService: RedisService;

  beforeEach(async () => {
    const mockCache: Cache = {
      get: jest.fn((): Promise<any> => Promise.resolve('mocked value')),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
      wrap: jest.fn(),
      store: {
        get: jest.fn((key: string): Promise<any> => Promise.resolve(key)),
        set: jest.fn(),
        del: jest.fn(),
        reset: jest.fn(),
        mset: jest.fn(),
        mget: jest.fn(),
        mdel: jest.fn(),
        keys: jest.fn(),
        ttl: jest.fn(),
      },
    };

    redisService = new RedisService(mockCache);
  });

  it('should be defined', () => {
    expect(redisService).toBeDefined();
  });

  describe('get value', () => {
    it('successfully get value from redis store', async () => {
      const testValue = await redisService.getValue<string>('test');
      expect(testValue).toEqual('test');
      const testOtherValue = await redisService.getValue<string>('dorito');
      expect(testOtherValue).toEqual('dorito');
    });
  });
});

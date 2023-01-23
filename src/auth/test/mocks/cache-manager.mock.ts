import { CACHE_MANAGER, ValueProvider } from '@nestjs/common';
import { Cache, Store } from 'cache-manager';
import { PublicPart } from '../utils/public-part.type';

const mockStore: Store = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
  mset: jest.fn(),
  mget: jest.fn(),
  mdel: jest.fn(),
  keys: jest.fn(),
  ttl: jest.fn(),
};

export const mockCacheManager: ValueProvider<PublicPart<Cache>> = {
  provide: CACHE_MANAGER,
  useValue: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    reset: jest.fn(),
    wrap: jest.fn(),
    store: mockStore,
  },
};

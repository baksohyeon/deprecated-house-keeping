// TODO: redis key-value 명시하고 싶음 (namespace 헷갈료..)

export interface TokenRedisState {
  [key: string]: boolean;
}

export interface RefreshTokenLists {
  [key: string]: string[];
}

type RedisTokenjtiNameSpace = {
  tokenjti: 'accessToken-jti' | 'refreshToken-jti';
};

type RedisTokenjti = {
  jti: string;
};

const redisTokenExample = {
  namespace: 'accessToken-jti',
  key: 'accessToken-jti:jtivalue1234',
  value: {
    isActive: true,
  },
};

export type TokenKey = `${'access' | 'refresh'}Token-jti:${string}`;

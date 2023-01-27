import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';
import { User } from 'src/entities/user.entity';
import { mockedConfigService } from './mocks/config.service.mock';
import { mockRepository } from './mocks/reposiotry.mock';
import tokenConfig from 'src/config/token.config';
import { mockTokenConfig } from './mocks/token.config.mock';
import { RedisService } from '../redis/redis.service';
import { AuthController } from '../auth.controller';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  Token,
  TokenType,
} from 'src/interfaces/tokens.interface';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus } from '@nestjs/common';

jest.mock('uuid', () => ({ v4: () => MOCK_UUID }));
const JWT_SIGNED_TOKEN = 'abc1.def2.ghi3';
const MOCK_UUID = 'mocked-uuid';
const MOCK_USER_ID = 'mocked-user-id';
const MOCK_VALID_ACCESS_TOKEN = 'mOcKVa.lIdAccEs.sTokEn';
const MOCK_VALID_REFRESH_TOKEN = 'mOcKVa.lIRefre.shTokEn';
const MOCK_INVALID_ACCESS_TOKEN = 'mOcKin.ValIdAcc.EssTokEn';

const mockedUser = {
  id: MOCK_USER_ID,
  email: 'test@abc.com',
  username: 'dorito',
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies User;

describe('AuthService', () => {
  let authService: AuthService;
  let redisService: RedisService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: tokenConfig.KEY,
          useValue: mockTokenConfig,
        },
        {
          provide: RedisService,
          useValue: {
            save: jest.fn(),
            getValue: jest.fn(async (redisKey: string) => {
              if (redisKey.match(/userId:.+:refreshToken-jti:.+/g)) {
                return true;
              }
              if (redisKey.match(/userId:.+:accessToken-jti:.+/g)) {
                return undefined;
              }
            }),
            delete: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => JWT_SIGNED_TOKEN),
            verify: jest.fn((token, { secret, ignoreExpiration }) => {
              if (token === MOCK_VALID_ACCESS_TOKEN) {
                return {
                  jti: 'mocked-refresh-jti',
                  userId: MOCK_USER_ID,
                  tokenType: 'refresh',
                } satisfies RefreshTokenPayload;
              } else if (token === MOCK_VALID_REFRESH_TOKEN) {
                return {
                  jti: 'mocked-jti',
                  userId: MOCK_USER_ID,
                  tokenType: 'access',
                  refreshTokenId: 'mocked-refresh-jti',
                } satisfies AccessTokenPayload;
              } else if (token === MOCK_INVALID_ACCESS_TOKEN) {
                return {
                  jti: 'mocked-jti',
                  userId: MOCK_USER_ID,
                  tokenType: 'access',
                  refreshTokenId: 'mocked-not-matched-refresh-jti',
                } satisfies AccessTokenPayload;
              } else {
                throw new Error('Invalid token');
              }
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    redisService = module.get<RedisService>(RedisService);
    jest.clearAllMocks();
  });

  describe('mock uuid', () => {
    it('should return testId', () => {
      const uuid = uuidv4();
      expect(uuid).toBe(MOCK_UUID);

      const uuid2 = uuidv4();
      expect(uuid2).toBe(MOCK_UUID);
    });
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('generateTokens', () => {
    it('should be return tokens', async () => {
      const tokens = await authService.generateTokensAndSaveToRedis(
        MOCK_USER_ID,
      );
      expect(tokens.accessToken).toStrictEqual({
        token: JWT_SIGNED_TOKEN,
        jti: MOCK_UUID,
      });

      expect(tokens.refreshToken).toStrictEqual({
        token: JWT_SIGNED_TOKEN,
        jti: MOCK_UUID,
      });
    });

    it('should be ensure that  RedisService - save method is excuted', async () => {
      const tokens = await authService.generateTokensAndSaveToRedis(
        MOCK_USER_ID,
      );
      const redisSaveMethodSpy = jest.spyOn(redisService, 'save');
      expect(redisSaveMethodSpy).toBeCalledTimes(2);

      expect(redisSaveMethodSpy).toHaveBeenNthCalledWith(
        1,
        `userId:${MOCK_USER_ID}:accessToken-jti:${MOCK_UUID}`,
        true,
        1,
      );

      expect(redisSaveMethodSpy).toHaveBeenNthCalledWith(
        2,
        `userId:${MOCK_USER_ID}:refreshToken-jti:${MOCK_UUID}`,
        true,
        10,
      );
    });
  });

  describe('reissueAccessToken', () => {
    it('should be return reissued tokens', async () => {
      const expiredToken = MOCK_VALID_REFRESH_TOKEN;
      const refreshToken = MOCK_VALID_ACCESS_TOKEN;
      const result = await authService.reissueTokensAndSaveToRedis(
        expiredToken,
        refreshToken,
        MOCK_USER_ID,
      );
      expect(result).toEqual({
        statusCode: HttpStatus.ACCEPTED,
        message: 'tokens are reissued',
        userId: MOCK_USER_ID,
        reissuedTokens: {
          accessToken: {
            token: JWT_SIGNED_TOKEN,
            jti: MOCK_UUID,
          },
          refreshToken: {
            token: JWT_SIGNED_TOKEN,
            jti: MOCK_UUID,
          },
        },
      });
    });

    it('should be throw error if accessToken exists on redis', async () => {
      const spyRedisGetValue = jest.spyOn(redisService, 'getValue');
      spyRedisGetValue.mockImplementation(async (redisKey) => {
        if (redisKey.match(/userId:.+:refreshToken-jti:.+/g)) {
          return true;
        }
        if (redisKey.match(/userId:.+:accessToken-jti:.+/g)) {
          return true;
        }
      });
      const expiredToken = MOCK_VALID_REFRESH_TOKEN;
      const refreshToken = MOCK_VALID_ACCESS_TOKEN;
      const result = await authService.reissueTokensAndSaveToRedis(
        expiredToken,
        refreshToken,
        MOCK_USER_ID,
      );

      expect(result).toStrictEqual({
        statusCode: HttpStatus.NOT_ACCEPTABLE,
        message: '유효하지 않은 액세스 토큰입니다.',
      });
    });

    it('should be throw error if refresh token not exists on redis', async () => {
      const spyRedisGetValue = jest.spyOn(redisService, 'getValue');
      spyRedisGetValue.mockImplementation(async (redisKey) => {
        if (redisKey.match(/userId:.+:refreshToken-jti:.+/g)) {
          return undefined;
        }
        if (redisKey.match(/userId:.+:accessToken-jti:.+/g)) {
          return undefined;
        }
      });
      const accessToken = MOCK_VALID_REFRESH_TOKEN;
      const refreshToken = MOCK_VALID_ACCESS_TOKEN;
      const result = await authService.reissueTokensAndSaveToRedis(
        accessToken,
        refreshToken,
        MOCK_USER_ID,
      );

      expect(result).toStrictEqual({
        statusCode: HttpStatus.NOT_ACCEPTABLE,
        message: '유효하지 않은 리프레시 토큰입니다.',
      });
    });

    it('should be throw error if jti is not matched', async () => {
      const spyRedisGetValue = jest.spyOn(redisService, 'getValue');
      const accessToken = MOCK_VALID_REFRESH_TOKEN;
      const refreshToken = MOCK_INVALID_ACCESS_TOKEN;
      const result = await authService.reissueTokensAndSaveToRedis(
        accessToken,
        refreshToken,
        MOCK_USER_ID,
      );

      expect(result).toStrictEqual({
        statusCode: HttpStatus.NOT_ACCEPTABLE,
        message: '유효하지 않은 토큰 요청입니다.',
      });

      expect(spyRedisGetValue).toBeCalledTimes(2);
    });
  });
});

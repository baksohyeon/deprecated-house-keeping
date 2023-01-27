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
} from 'src/interfaces/tokens.interface';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus } from '@nestjs/common';

const JWT_SIGNED_TOKEN = 'abc1.def2.ghi3';
const MOCK_UUID = 'mocked-uuid';
jest.mock('uuid', () => ({ v4: () => MOCK_UUID }));

const mockedUser = {
  id: 'uuid',
  email: 'test@abc.com',
  username: 'dorito',
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies User;

describe('AuthService', () => {
  let authService: AuthService;
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
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => JWT_SIGNED_TOKEN),
            verify: jest.fn((token, { secret, ignoreExpiration }) => {
              if (token === 'valid-refresh-token') {
                return {
                  jti: 'mocked-refresh-jti',
                  userId: 'mocked-user-id',
                  tokenType: 'refresh',
                } satisfies RefreshTokenPayload;
              } else if (token === 'valid-access-token') {
                return {
                  jti: 'mocked-jti',
                  userId: 'mocked-user-id',
                  tokenType: 'access',
                  refreshTokenId: 'mocked-refresh-jti',
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
      const userId = 'uuid';
      const tokens = await authService.generateTokensAndSaveToRedis(userId);
      expect(tokens.accessToken).toStrictEqual({
        token: JWT_SIGNED_TOKEN,
        jti: MOCK_UUID,
      });

      expect(tokens.refreshToken).toStrictEqual({
        token: JWT_SIGNED_TOKEN,
        jti: MOCK_UUID,
      });
    });
  });

  describe('reissueAccessToken', () => {
    it('should be return reissued tokens', async () => {
      const spyCheckNotExistAndSaveAccessToken = jest.spyOn(
        authService,
        'checkNotExistAndSaveAccessToken',
      );
      spyCheckNotExistAndSaveAccessToken.mockResolvedValue(true);

      const expiredToken = 'valid-access-token';
      const refreshToken = 'valid-refresh-token';
      const result = await authService.reissueAccessToken(
        expiredToken,
        refreshToken,
      );
      expect(result).toEqual({
        statusCode: HttpStatus.ACCEPTED,
        message: 'access token is reissued',
        userId: 'mocked-user-id',
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

    it('should be call checkNotExistAndSaveAccessToken Method');
  });
});

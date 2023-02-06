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

const mockedUser = {
  id: 'uuid',
  email: 'test@abc.com',
  username: 'dorito',
  refreshToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: new Date(),
} as User;

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            constructor: jest.fn(),
            // TODO: 모킹하기
          },
        },
        {
          provide: tokenConfig.KEY,
          useValue: mockTokenConfig,
        },
        { provide: ConfigService, useValue: mockedConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });
});

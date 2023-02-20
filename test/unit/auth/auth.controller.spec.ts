import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../../../src/module/auth/auth.service';
import { User } from 'src/entities/user.entity';
import { mockedConfigService } from '../../mocks/config.service.mock';
import { mockRepository } from '../../mocks/reposiotry.mock';
import tokenConfig from 'src/config/token.config';
import { mockTokenConfig } from '../../mocks/token.config.mock';
import { RedisService } from '../../../src/module/auth/redis/redis.service';
import { AuthController } from '../../../src/module/auth/auth.controller';
import { HouseMember } from 'src/entities/houseMember.entity';

const mockUser = {
  id: 'uuid',
  email: 'test@abcd.com',
  username: 'test user',
  housemembers: [new HouseMember()],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
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

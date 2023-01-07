import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';
import { minuteToMilisecond } from 'src/util/units-of-time-conversion.util';
import { User } from 'src/entities/user.entity';
import { mockedConfigService } from './mocks/config.service';
import { mockedJwtService } from './mocks/jwt.service';

const mockedUser = {
  id: 'uuid',
  email: 'test@abc.com',
  username: 'dorito',
  refreshToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as User;

export const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockReturnValueOnce(true),
  })),
});

describe('AuthService', () => {
  let authService: AuthService;
  let mockedUserRepository: Repository<User>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
        // GoogleStrategy,
        // JwtAuthStrategy,
        // JwtRefreshStrategy,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('When reset cookie options', () => {
    it('should be return max age value is 0', () => {
      const resetCookieOptions = authService.resetCookieOptions();
      expect(resetCookieOptions.maxAge).toEqual(0);
    });

    it('reset null refrech token in database', () => {
      const userId = 'uuid';
      jest.spyOn(authService, 'resetRefreshToken');
    });
  });

  describe('Sign in', () => {
    it('should be definded ');
  });
});

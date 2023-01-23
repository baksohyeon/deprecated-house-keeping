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
import { mockedConfigService } from './mocks/config.service.mock';
import { mockedJwtService } from './mocks/jwt.service.mock';
import { mockRepository } from './mocks/reposiotry.mock';

const mockedUser = {
  id: 'uuid',
  email: 'test@abc.com',
  username: 'dorito',
  refreshToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as User;

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
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    mockedUserRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  describe('When reset cookie options', () => {
    it("should be return cookie's max age value is 0", () => {
      const resetCookieOptions = authService.resetCookieOptions();
      expect(resetCookieOptions.maxAge).toEqual(0);
      expect(resetCookieOptions.sameSite).toBeTruthy();
      expect(resetCookieOptions.secure).toBeFalsy();
    });

    it('reset null refrech token in database', () => {
      const userId = 'uuid';
      authService.resetRefreshToken(userId);

      expect(mockedUserRepository.createQueryBuilder).toHaveBeenCalled();
      expect(
        mockedUserRepository.createQueryBuilder().update().set,
      ).toHaveBeenCalledWith({ hashedRefreshToken: null });
      expect(mockedUserRepository.createQueryBuilder().execute).toBeCalledTimes(
        1,
      );
    });
  });
});

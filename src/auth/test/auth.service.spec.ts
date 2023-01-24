import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';
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
});

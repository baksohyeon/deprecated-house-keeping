import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RequestLoginUserDto } from 'src/module/auth/dto/request-login-user.dto';
import { HouseMember } from 'src/entities/houseMember.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../../../src/module/user/user.service';

const mockRequestLoginUserDto = {
  email: 'test@abcd.com',
  username: 'test user',
} satisfies RequestLoginUserDto;

const mockUser = {
  id: 'uuid',
  email: 'test@abcd.com',
  username: 'test user',
  housemembers: [new HouseMember()],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
} as User;

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest
              .fn((email: string) => mockUser)
              .mockName('findOneby'),
            create: jest.fn().mockName('repository.create'),
            save: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      const repoSpy = jest.spyOn(userRepository, 'findOneBy');
      const user = await userService.findUserByEmail('test@abcd.com');
      expect(user).toBe(mockUser);
      expect(repoSpy).toBeCalledWith({ email: 'test@abcd.com' });
    });

    it('should be return null if user email not exists', async () => {
      const repoSpy = jest.spyOn(userRepository, 'findOneBy');
      repoSpy.mockResolvedValue(null);
      expect(userService.findUserByEmail('notExsits@abcd.com')).resolves
        .toBeNull;
    });
  });

  describe('createUser', () => {
    it('should be call create method in repository', async () => {
      const repoSpy = jest.spyOn(userRepository, 'create');
      const newUser = await userService.createUser(mockRequestLoginUserDto);
      expect(repoSpy).toBeCalledTimes(1);
      expect(newUser).toBe(mockUser);
    });
  });

  describe('findUserById', () => {
    it('should be find by Id', async () => {
      const repoSpy = jest.spyOn(userRepository, 'findOneBy');
      const user = await userService.findUserById('uuid');
      expect(user).toBe(mockUser);
      expect(repoSpy).toBeCalledWith({ id: 'uuid' });
    });

    it('should be return null corresponding user id not exists', async () => {
      const repoSpy = jest.spyOn(userRepository, 'findOneBy');
      repoSpy.mockResolvedValue(null);
      expect(userService.findUserById('uuid')).resolves.toBeNull;
    });
  });

  describe('registerUser', () => {
    it('should be create new user if corresponding email not exists on database', async () => {
      const findUserByEmailServiceSpy = jest.spyOn(
        userService,
        'findUserByEmail',
      );
      const createUserServiceSpy = jest.spyOn(userService, 'createUser');
      findUserByEmailServiceSpy.mockResolvedValue(null);
      const user = await userService.registerUser(mockRequestLoginUserDto);

      expect(createUserServiceSpy).toBeCalledTimes(1);
      expect(user).toBe(mockUser);
    });

    it('should be return user if already exists on database', async () => {
      const findUserByEmailServiceSpy = jest.spyOn(
        userService,
        'findUserByEmail',
      );
      const createUserServiceSpy = jest.spyOn(userService, 'createUser');
      findUserByEmailServiceSpy.mockResolvedValue(mockUser);
      const user = await userService.registerUser(mockRequestLoginUserDto);

      expect(createUserServiceSpy).toBeCalledTimes(0);
      expect(user).toBe(mockUser);
    });
  });
});

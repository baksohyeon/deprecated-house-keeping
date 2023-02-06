import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/entities/user.entity';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';

const USER = {
  id: 'uuid',
  username: 'test user name',
  email: 'test@user.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
} satisfies User;

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findUserById: jest
              .fn()
              .mockImplementation((userId: string) => Promise.resolve(USER)),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getById', () => {
    it('should get a single cat', async () => {
      await expect(controller.getUserProfile('uuid')).resolves.toEqual(USER);
    });
  });
});

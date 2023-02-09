import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from 'src/mocks/reposiotry.mock';
import { House } from 'src/entities/house.entity';
import { HouseMember } from 'src/entities/houseMember.entity';
import { Repository } from 'typeorm';
import { HouseService } from '../house.service';
import { CreateHouseDto } from 'src/dto/create-house.dto';
import { User } from 'src/entities/user.entity';

const newDate = new Date();

const MOCK_CREATE_HOUSE_DTO = {
  houseName: 'house name example',
} satisfies CreateHouseDto;

const MOCK_USER = (): User => {
  const user = new User();
  user.id = 'uuid';
  user.email = 'test@email.com';
  user.username = 'testUser';
  user.createdAt = newDate;
  user.updatedAt = newDate;
  user.deletedAt = null;
  user.housemember = [];
  return user;
};

const MOCK_HOUSE = (): House => {
  const house = new House();
  house.id = 1;
  house.name = MOCK_CREATE_HOUSE_DTO.houseName;
  house.houseMember = [];
  house.createdAt = newDate;
  house.updatedAt = newDate;
  house.deletedAt = null;
  return house;
};

const MOCK_HOUSE_MEMBER = (): HouseMember => {
  const houseMember = new HouseMember();
  houseMember.id = 1;
  houseMember.user = MOCK_USER();
  houseMember.house = MOCK_HOUSE();
  houseMember.backlog = 'No Tasks';
  houseMember.role = 'Admin';
  houseMember.createdAt = newDate;
  houseMember.updatedAt = newDate;
  houseMember.deletedAt = null;
  return {
    id: 1,
    user: MOCK_USER(),
    house: MOCK_HOUSE(),
    backlog: 'No Tasks',
    role: 'Admin',
    createdAt: newDate,
    updatedAt: newDate,
    deletedAt: null,
  };
};

describe('HouseService', () => {
  let service: HouseService;
  let houseRepository: Repository<House>;
  let houseMemberRepository: Repository<HouseMember>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HouseService,
        {
          provide: getRepositoryToken(House),
          useValue: {
            create: jest
              .fn((name) => MOCK_HOUSE())
              .mockName('house repo create function'),
            save: jest
              .fn()
              .mockReturnValue(MOCK_HOUSE())
              .mockName('house repository save function'),
          },
        },
        {
          provide: getRepositoryToken(HouseMember),
          useValue: {
            save: jest
              .fn()
              .mockResolvedValue(MOCK_HOUSE_MEMBER())
              .mockName('house member repository save function'),
          },
        },
      ],
    }).compile();

    service = module.get<HouseService>(HouseService);
    houseMemberRepository = module.get<Repository<HouseMember>>(
      getRepositoryToken(HouseMember),
    );
    houseRepository = module.get<Repository<House>>(getRepositoryToken(House));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be called correctly', async () => {
    const house = await service.createNewHouse(
      MOCK_CREATE_HOUSE_DTO,
      MOCK_USER(),
    );
    const houseRepoCreateSpy = jest.spyOn(houseRepository, 'create');
    const houseRepoSaveSpy = jest.spyOn(houseRepository, 'save');
    const houseMemberRepoSaveSpy = jest.spyOn(houseMemberRepository, 'save');

    expect(houseRepoCreateSpy).toBeCalledWith({
      name: MOCK_CREATE_HOUSE_DTO.houseName,
    });
    expect(houseRepoSaveSpy).toBeCalledWith(MOCK_HOUSE());

    expect(house).toStrictEqual(MOCK_HOUSE_MEMBER());
    expect(houseMemberRepoSaveSpy).toBeCalled();
  });
});

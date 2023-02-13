import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from 'test/mocks/reposiotry.mock';
import { House } from 'src/entities/house.entity';
import { HouseMember } from 'src/entities/houseMember.entity';
import { Repository } from 'typeorm';
import { HouseService } from '../../../src/house/house.service';
import { CreateHouseDto } from 'src/dto/create-house.dto';
import { User } from 'src/entities/user.entity';

describe('HouseService', () => {
  let houseService: HouseService;
  let houseRepository: Repository<House>;
  let houseMemberRepository: Repository<HouseMember>;

  const newDate = new Date();

  const mockUser = new User();
  Object.assign(mockUser, {
    id: 'uuid',
    email: 'dorito@email.com',
    username: 'dorito',
    createdAt: newDate,
    updatedAt: newDate,
    deletedAt: null,
    housemembers: [],
  } satisfies User);

  const mockHouse = new House();
  Object.assign(mockHouse, {
    id: 1,
    houseMembers: [],
    name: 'house name',
    createdAt: newDate,
    updatedAt: newDate,
    deletedAt: null,
  } satisfies House);

  const mockHouseMember = new HouseMember();
  Object.assign(mockHouseMember, {
    id: 1,
    house: new House(),
    user: new User(),
    backlog: 'No Tasks',
    role: 'Admin',
    createdAt: newDate,
    updatedAt: newDate,
    deletedAt: null,
  } satisfies HouseMember);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HouseService,
        {
          provide: getRepositoryToken(House),
          useValue: {
            create: jest
              .fn((house: CreateHouseDto) => {
                let houseObject = mockHouse;
                houseObject.name = house.houseName;
                return mockHouse;
              })
              .mockName('house repo create function'),
            save: jest.fn().mockName('house repository save function'),
            findOneOrFail: jest.fn().mockReturnValue(mockHouse),
          },
        },
        {
          provide: getRepositoryToken(HouseMember),
          useValue: {
            save: jest
              .fn()
              .mockResolvedValue(mockHouseMember)
              .mockName('house member repository save function'),
            find: jest.fn().mockName('house member repository find method'),
          },
        },
      ],
    }).compile();

    houseService = module.get<HouseService>(HouseService);
    houseMemberRepository = module.get<Repository<HouseMember>>(
      getRepositoryToken(HouseMember),
    );
    houseRepository = module.get<Repository<House>>(getRepositoryToken(House));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(houseService).toBeDefined();
  });

  describe('create new house', () => {
    it('create new House as Admin', async () => {
      const HOUSE_NAME = 'test to verify';
      const createHouseDto = {
        houseName: HOUSE_NAME,
      } satisfies CreateHouseDto;

      const EXPECT_HOUSE = () => {
        let house = mockHouse;
        house.name = createHouseDto.houseName;
        return house;
      };

      const EXPECT_HOUSE_MEMBER = () => {
        let houseMember = mockHouseMember;
        houseMember.house = EXPECT_HOUSE();
        houseMember.user = mockUser;
        return houseMember;
      };

      const house = await houseService.createNewHouse(createHouseDto, mockUser);
      const houseRepoCreateSpy = jest.spyOn(houseRepository, 'create');
      const houseRepoSaveSpy = jest.spyOn(houseRepository, 'save');
      const houseMemberRepoSaveSpy = jest.spyOn(houseMemberRepository, 'save');

      expect(houseRepoCreateSpy).toBeCalledWith({
        name: HOUSE_NAME,
      });
      expect(houseRepoSaveSpy).toBeCalledWith(EXPECT_HOUSE());
      expect(houseMemberRepoSaveSpy).toBeCalled();
      expect(house).toStrictEqual(EXPECT_HOUSE_MEMBER());
    });
  });

  describe('getAllHouseByUser', () => {
    it('should be called with correct argument', async () => {
      const houseMemberRepoFindSpy = jest.spyOn(houseMemberRepository, 'find');
      const findArgs = {
        where: {
          user: { id: mockUser.id },
        },
        relations: ['user', 'house'],
      };
      houseService.getAllHouseByUser(mockUser);
      expect(houseMemberRepoFindSpy).toBeCalled();
      expect(houseMemberRepoFindSpy).toBeCalledWith(findArgs);
    });
  });

  describe('getHouseByHoudId', () => {
    it('should be get single house', async () => {
      const houseId = 1;
      const houseRepositorySpy = jest.spyOn(houseRepository, 'findOneOrFail');
      const house = await houseService.getHouseByHouseId(houseId);
      expect(house).toStrictEqual(mockHouse);
      expect(house.id).toEqual(houseId);
      expect(houseRepositorySpy).toBeCalledWith({
        relations: {
          houseMembers: true,
        },
        where: {
          id: houseId,
        },
      });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from 'test/mocks/reposiotry.mock';
import { House } from 'src/entities/house.entity';
import { HouseMember } from 'src/entities/houseMember.entity';
import { Repository } from 'typeorm';
import { HouseService } from '../../../src/module/house/house.service';
import { CreateHouseDto } from 'src/module/house/dto/create-house.dto';
import { User } from 'src/entities/user.entity';
import { UpdateHouseDto } from 'src/module/house/dto/update-house.dto';

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
  } as User);

  const mockHouse = new House();
  Object.assign(mockHouse, {
    id: 1,
    houseMembers: [],
    name: 'house name',
    createdAt: newDate,
    updatedAt: newDate,
    deletedAt: null,
    houseworks: [],
  } satisfies House);

  const mockHouseMember = new HouseMember();
  Object.assign(mockHouseMember, {
    id: 1,
    house: new House(),
    user: new User(),
    houseId: new House().id,
    userId: new User().id,
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
            create: jest.fn().mockName('house repo create function'),
            save: jest
              .fn()
              .mockReturnThis()
              .mockName('house repository save function'),
            findOneOrFail: jest.fn().mockReturnValue(mockHouse),
            update: jest.fn(),
            softRemove: jest.fn(),
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
      const createHouseDto: CreateHouseDto = {
        name: HOUSE_NAME,
      };

      const house = await houseService.createNewHouse(createHouseDto, mockUser);
      const houseRepoCreateSpy = jest.spyOn(houseRepository, 'create');
      const houseRepoSaveSpy = jest.spyOn(houseRepository, 'save');
      const houseMemberRepoSaveSpy = jest.spyOn(houseMemberRepository, 'save');

      expect(houseRepoCreateSpy).toBeCalledWith({
        name: HOUSE_NAME,
      });
      expect(houseMemberRepoSaveSpy).toBeCalledTimes(1);
      expect(houseRepoSaveSpy).toBeCalled();
      expect(house).toBeDefined();
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
        transaction: true,
      });
    });
  });

  describe('renameHouse', () => {
    it('should be called with correct arguments', async () => {
      const updateHouseDto = {
        houseName: 'test',
      } satisfies UpdateHouseDto;
      const HOUSE_ID = 10;

      const houseRepositoryUpdateSpy = jest.spyOn(houseRepository, 'update');
      houseService.renameHouse(HOUSE_ID, updateHouseDto);
      expect(houseRepositoryUpdateSpy).toBeCalledWith(HOUSE_ID, {
        name: updateHouseDto.houseName,
      });
    });
  });

  describe('soft remove house', () => {
    it('should be called with correct arguments', async () => {
      const HOUSE_ID = 17348;
      const houseServiceSpy = jest.spyOn(houseService, 'getHouseByHouseId');
      await houseService.softDeleteHouse(HOUSE_ID);
      expect(houseServiceSpy).toBeCalled();
      expect(houseServiceSpy).toBeCalledWith(HOUSE_ID);
      expect(houseRepository.softRemove).toBeCalled();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { House } from 'src/entities/house.entity';
import { HouseMember } from 'src/entities/houseMember.entity';
import { Repository } from 'typeorm';
import { HouseService } from '../house.service';

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
          useValue: {},
        },
        {
          provide: getRepositoryToken(HouseMember),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<HouseService>(HouseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Housework } from 'src/entities/housework.entity';
import { HouseworkService } from '../../../src/module/housework/housework.service';

describe('HouseworkService', () => {
  let service: HouseworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HouseworkService,
        {
          provide: getRepositoryToken(Housework),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<HouseworkService>(HouseworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

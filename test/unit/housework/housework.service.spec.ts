import { Test, TestingModule } from '@nestjs/testing';
import { HouseworkService } from '../../../src/housework/housework.service';

describe('HouseworkService', () => {
  let service: HouseworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HouseworkService],
    }).compile();

    service = module.get<HouseworkService>(HouseworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { HouseworkService } from 'src/module/housework/housework.service';
import { HouseworkController } from '../../../src/module/housework/housework.controller';

describe('HouseworkController', () => {
  let controller: HouseworkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HouseworkController],
      providers: [
        {
          provide: HouseworkService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<HouseworkController>(HouseworkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

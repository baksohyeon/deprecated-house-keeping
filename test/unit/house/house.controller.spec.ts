import { Test, TestingModule } from '@nestjs/testing';
import { HouseController } from '../../../src/house/house.controller';
import { HouseService } from '../../../src/house/house.service';

describe('HouseController', () => {
  let controller: HouseController;
  let service: HouseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HouseController],
      providers: [
        {
          provide: HouseService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<HouseController>(HouseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

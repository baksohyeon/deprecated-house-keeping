import { Test, TestingModule } from '@nestjs/testing';
import { HouseService } from 'src/module/house/house.service';
import { MemberService } from 'src/module/member/member.service';
import { MemberController } from '../../../src/module/member/member.controller';

describe('MemberController', () => {
  let memberController: MemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        {
          provide: MemberService,
          useValue: {},
        },
      ],
    }).compile();

    memberController = module.get<MemberController>(MemberController);
  });

  it('should be defined', () => {
    expect(memberController).toBeDefined();
  });
});

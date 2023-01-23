import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  // 얘한테 테스트 코드 허스키 붙이면 됨
  // 쓴 코드 허스키한테 싹다 세팅해보기
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

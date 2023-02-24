import {
  applyDecorators,
  Injectable,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { HouseMember } from 'src/entities/houseMember.entity';
import { REQUEST_CONTEXT } from 'src/validators/Interceptor/inject-user.interceptor';
import { ExtendedValidationArguments } from 'src/validators/constraint/extended-validation-arguments.interface';
import { MemberService } from 'src/module/member/member.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidHouseMemberValidatorConstraint
  implements ValidatorConstraintInterface
{
  constructor(private memberService: MemberService) {}

  async validate(houseId: number, args?: ExtendedValidationArguments) {
    const userId = args?.object[REQUEST_CONTEXT].user.id;
    console.log(houseId);
    return this.memberService.isValidHouseMember(houseId, userId);
  }

  defaultMessage(): string {
    return '유저가 해당 House에 속해있지 않습니다.';
  }
}

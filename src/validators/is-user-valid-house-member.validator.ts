import {
  applyDecorators,
  Injectable,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { HouseMember } from 'src/entities/houseMember.entity';
import {
  InjectUserInterceptor,
  REQUEST_CONTEXT,
} from 'src/validators/Interceptor/inject-user.interceptor';
import { ExtendedValidationArguments } from 'src/validators/extended-validation-arguments.interface';
import { MemberService } from 'src/module/member/member.service';
import { StripRequestContextPipe } from 'src/validators/pipe/strip-request-context.pipe';
import { Repository } from 'typeorm';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidHouseMemberValidatorConstraint
  implements ValidatorConstraintInterface
{
  constructor(private memberService: MemberService) {}

  async validate(houseId: number, args?: ExtendedValidationArguments) {
    console.log('argss', args);
    const userId = args?.object[REQUEST_CONTEXT].user.id;
    console.log(houseId);
    return this.memberService.isValidHouseMember(+houseId, userId);
  }

  defaultMessage(): string {
    return '유저가 House 에 속해있지 않거나 존재하지 않은 House 입니다.';
  }
}

export function IsValidMember(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidMember',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidHouseMemberValidatorConstraint,
    });
  };
}

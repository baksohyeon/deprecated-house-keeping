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
} from 'src/Interceptor/request-user.interceptor';
import { ExtendedValidationArguments } from 'src/interfaces/extended-validation-arguments.interface';
import { StripRequestContextPipe } from 'src/pipe/strip-request-context.pipe';
import { Repository } from 'typeorm';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidHouseMemberValidatorConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    @InjectRepository(HouseMember)
    private houseMemberRepository: Repository<HouseMember>,
  ) {}

  async validate(houseId: number, args?: ExtendedValidationArguments) {
    const userId = args?.object[REQUEST_CONTEXT].user.id;

    if (userId && Number.isInteger(houseId)) {
      const house = await this.houseMemberRepository.find({
        where: {
          userId,
          houseId,
        },
      }); // Checking if comment belongs to selected user

      if (!house) {
        return false;
      }
    }
    return true;
  }

  defaultMessage(): string {
    return 'The user does not belong to the house';
  }
}

export function IsValidMember(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidMember',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidHouseMemberValidatorConstraint,
    });
  };
}

export function InjectUserToQuery() {
  return applyDecorators(InjectUserTo('query'));
}

export function InjectUserToBody() {
  return applyDecorators(InjectUserTo('body'));
}

export function InjectUserToParam() {
  return applyDecorators(InjectUserTo('params'));
}

export function InjectUserTo(context: 'query' | 'body' | 'params' | null) {
  return applyDecorators(
    UseInterceptors(new InjectUserInterceptor(context)),
    UsePipes(StripRequestContextPipe),
  );
}

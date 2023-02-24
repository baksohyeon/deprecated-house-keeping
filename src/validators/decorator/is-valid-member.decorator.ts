import { ValidationOptions, registerDecorator } from 'class-validator';
import { IsValidHouseMemberValidatorConstraint } from '../constraint/is-user-valid-house-member.constraint';

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

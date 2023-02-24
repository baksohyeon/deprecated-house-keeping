import { ValidationArguments } from 'class-validator';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';
import { REQUEST_CONTEXT } from 'src/validators/Interceptor/inject-user.interceptor';

export interface ExtendedValidationArguments extends ValidationArguments {
  object: {
    [REQUEST_CONTEXT]: {
      user: User;
    };
  };
}

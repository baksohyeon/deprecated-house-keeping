import { ValidationArguments } from 'class-validator';
import { User } from 'src/entities/user.entity';
import { REQUEST_CONTEXT } from 'src/Interceptor/request-user.interceptor';

export interface ExtendedValidationArguments extends ValidationArguments {
  object: {
    [REQUEST_CONTEXT]: {
      user: User; // IUser is my interface for User class
    };
  };
}

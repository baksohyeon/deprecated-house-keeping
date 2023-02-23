import { Injectable, PipeTransform } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { REQUEST_CONTEXT } from 'src/validators/Interceptor/inject-user.interceptor';

@Injectable()
export class StripRequestContextPipe implements PipeTransform {
  transform(value: any) {
    const { _requestContext, ...params } = value;
    return params;
  }
}

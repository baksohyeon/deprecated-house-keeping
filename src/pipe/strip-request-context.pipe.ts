import { Injectable, PipeTransform } from '@nestjs/common';
import { REQUEST_CONTEXT } from 'src/Interceptor/request-user.interceptor';

@Injectable()
export class StripRequestContextPipe implements PipeTransform {
  transform(value: any) {
    const { REQUEST_CONTEXT, ...strippedData } = value;
    return strippedData;
  }
}

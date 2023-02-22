import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

export const REQUEST_CONTEXT = '_requestContext';

@Injectable()
export class InjectUserInterceptor implements NestInterceptor {
  constructor(private type?: 'query' | 'body' | 'params' | null) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (this.type && request[this.type]) {
      request[this.type][REQUEST_CONTEXT] = {
        user: request.user,
      };
    }

    return next.handle();
  }
}

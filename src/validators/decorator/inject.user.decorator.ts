import {
  applyDecorators,
  ParseIntPipe,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { InjectUserInterceptor } from 'src/validators/Interceptor/inject-user.interceptor';
import { StripRequestContextPipe } from 'src/validators/pipe/strip-request-context.pipe';

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

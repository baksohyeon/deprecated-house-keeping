import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOauthGaurd extends AuthGuard('google') {
  //   async canActivate(context: ExecutionContext): Promise<boolean> {
  //     const activate = (await super.canActivate(context)) as boolean;
  //     // as Promise<boolean>;
  //     const request = context.switchToHttp().getRequest();
  //     await super.logIn(request);
  //     return activate;
  //   }
}

import { Request } from 'express';

export const accessTokenCookieExtractor = function (req: Request): string {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['access_token'];
  }
  return token;
};

export const refreshTokenCookieExtractor = function (req: Request): string {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['refresh_token'];
  }
  return token;
};

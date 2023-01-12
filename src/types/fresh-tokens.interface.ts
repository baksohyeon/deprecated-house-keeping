export interface Token {
  token: string;
  jti: string;
}
export interface FreshTokens {
  accessToken: Token;
  refreshToken: Token;
}

export interface Token {
  token: string;
  jti: string;
}
export interface FreshTokens {
  accessToken: Token;
  refreshToken: Token;
}

export interface FreshTokensAndUserId extends FreshTokens {
  userId: string;
}

export type TokenType = 'access' | 'refresh';

export interface JwtRegisterdClaims {
  iat?: number;
  exp?: number;
  aud?: [string];
  iss?: string;
  jti?: string;
}

// make registered claims partial so we don't have to provide them when creating
// new objects
export interface TokenPayload extends JwtRegisterdClaims {
  userId: string;
  tokenType: TokenType;
}

export interface AccessTokenPayload extends TokenPayload {
  refreshTokenId: string;
}

export interface RefreshTokenPayload extends TokenPayload {}

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
export interface RawTokenPayload {
  iat?: number;
  exp?: number;
  aud?: [string];
  iss?: string;
  jti?: string;
  tokenType: TokenType;
}

export interface TokenPayloadUserInfo {
  userId: string;
}

export interface AccessTokenPayload extends RawTokenPayload {
  userId: string;
  refreshTokenId: string;
}

export interface RefreshTokenPayload extends RawTokenPayload {
  userId: string;
}

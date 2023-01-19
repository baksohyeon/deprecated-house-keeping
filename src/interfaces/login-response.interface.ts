import { FreshTokens } from './tokens.interface';

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
  };
  message: string;
  tokens: FreshTokens;
}

export interface loginUserInfo {
  email: string;
  username: string;
}

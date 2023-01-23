export const mockedConfigService = {
  get(key: string) {
    switch (key) {
      case 'JWT_ACCESS_TOKEN_SECRET':
        return 'accesstokentest123';

      case 'JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES':
        return 30;

      case 'JWT_REFRESH_TOKEN_SECRET':
        return 'refreshtokentest123';

      case 'JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS':
        return 7;
    }
  },
};

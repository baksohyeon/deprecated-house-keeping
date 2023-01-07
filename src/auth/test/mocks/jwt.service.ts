export const mockedJwtService = {
  sign: () => 'signed-token',
  verify: jest.fn(),
};

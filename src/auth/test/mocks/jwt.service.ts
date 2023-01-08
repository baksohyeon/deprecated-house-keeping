export const mockedJwtService = {
  sign: jest.fn(() => 'TOKEN'),
  verify: jest.fn(),
};

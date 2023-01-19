export type ServiceResultType<T> =
  | ServiceResultSuccess<T>
  | ServiceResultFail<T>
  | ServiceResultError;

export interface ServiceResultError {
  status: 'error';
  // every error must have a message.
  message: string;
  // The error that caused this process to fail. Useful for debugging.
  cause?: Error;
}

export interface ServiceResultFail<T> {
  // a friendly, predictable message about why the error failed
  message: string;
  // the errors, formatted nicely
  errors: Array<ResponseError>;
  status: 'fail';
  code?: 'NOT_FOUND' | 'INPUT_ERROR' | 'NOT_ALLOWED';
}

export interface ServiceResultSuccess<T> {
  message?: string;
  data: T;
  status: 'success';
}

export type ResponseError = {
  path?: any;
  message: string;
  value?: any;
};

export type UserType = {
  id: number;
  username: string;
};

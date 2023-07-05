export enum ValidationErrorEnum {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  EMPTY_VALUE = 'EMPTY_VALUE',
}

export type ValidationErrorType = {
  field: string;
  type: ValidationErrorEnum;
  details?: any;
};

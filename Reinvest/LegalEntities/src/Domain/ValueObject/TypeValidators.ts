import DateTime from 'date-and-time';

export enum ValidationErrorEnum {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  EMPTY_VALUE = 'EMPTY_VALUE',
  FAILED = 'FAILED',
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
  INVALID_ID_FORMAT = 'INVALID_ID_FORMAT',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_TYPE = 'INVALID_TYPE',
  MISSING_MANDATORY_FIELDS = 'MISSING_MANDATORY_FIELDS',
  ALREADY_COMPLETED = 'ALREADY_COMPLETED',
  NOT_UNIQUE = 'NOT_UNIQUE',
  NOT_ACTIVE = 'NOT_ACTIVE',
  WRONG_TYPE = 'WRONG_TYPE',
  NOT_FOUND = 'NOT_FOUND',
}

export type ValidationErrorType = {
  field: string;
  type: ValidationErrorEnum;
  details?: any;
};

export class ValidationError extends Error {
  private validationError: ValidationErrorEnum;
  private details: any;
  private fieldName: string;

  constructor(validationError: ValidationErrorEnum, fieldName: string, details: any = []) {
    super(fieldName + ':' + validationError);
    this.fieldName = fieldName;
    this.validationError = validationError;
    this.details = details;
  }

  getValidationError(): ValidationErrorType {
    return {
      field: this.fieldName,
      type: this.validationError,
      details: this.details,
    };
  }
}

export class NonEmptyString {
  protected value;

  constructor(value: string, name: string = 'NonEmptyString') {
    if (value.length === 0) {
      throw new ValidationError(ValidationErrorEnum.EMPTY_VALUE, name);
    }

    this.value = value;
  }

  toString(): string {
    return this.value;
  }
}

export class AnyString {
  protected value: string;

  constructor(value: string = '') {
    this.value = value;
  }

  toString(): string {
    return this.value;
  }
}

export class IsoDate {
  constructor(date: string) {
    if (!date || !DateTime.isValid(date, 'YYYY-MM-DD')) {
      throw new ValidationError(ValidationErrorEnum.INVALID_DATE_FORMAT, 'IsoDate');
    }
  }
}

export class Uuid {
  protected uuid: string;

  constructor(uuid: string) {
    if (!uuid) {
      throw new ValidationError(ValidationErrorEnum.EMPTY_VALUE, 'uuid');
    }

    if (uuid.length !== 36) {
      throw new ValidationError(ValidationErrorEnum.INVALID_ID_FORMAT, 'uuid');
    }

    this.uuid = uuid;
  }

  toString(): string {
    return this.uuid;
  }

  static create(id: string): Uuid {
    return new Uuid(id);
  }
}

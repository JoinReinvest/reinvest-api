import { ValidationError, ValidationErrorEnum } from 'LegalEntities/Domain/ValueObject/TypeValidators';

export type ValueRangeInput = {
  range: string;
};

export abstract class ValueRange {
  private range: string;

  constructor(range: string) {
    this.range = range;
  }

  static getValidRange(valueRangeInput: ValueRangeInput, name: string): string {
    try {
      const { range } = valueRangeInput;

      if (!range) {
        throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, name);
      }

      return range;
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, name);
    }
  }

  toObject(): ValueRangeInput {
    return {
      range: this.range,
    };
  }
}

export class NetWorth extends ValueRange {
  static create(valueRangeInput: ValueRangeInput): NetWorth {
    const range = ValueRange.getValidRange(valueRangeInput, 'netWorth');

    return new NetWorth(range);
  }
}

export class NetIncome extends ValueRange {
  static create(valueRangeInput: ValueRangeInput): NetIncome {
    const range = ValueRange.getValidRange(valueRangeInput, 'netIncome');

    return new NetWorth(range);
  }
}

export class AnnualRevenue extends ValueRange {
  static create(valueRangeInput: ValueRangeInput): AnnualRevenue {
    const range = ValueRange.getValidRange(valueRangeInput, 'annualRevenue');

    return new AnnualRevenue(range);
  }
}

export class NumberOfEmployees extends ValueRange {
  static create(valueRangeInput: ValueRangeInput): NumberOfEmployees {
    const range = ValueRange.getValidRange(valueRangeInput, 'numberOfEmployees');

    return new NumberOfEmployees(range);
  }
}

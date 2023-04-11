import { ToObject } from 'LegalEntities/Domain/ValueObject/ToObject';
import { ValidationError, ValidationErrorEnum } from 'LegalEntities/Domain/ValueObject/TypeValidators';

export enum CorporateType {
  PARTNERSHIP = 'PARTNERSHIP',
  LLC = 'LLC',
  CORPORATION = 'CORPORATION',
}

export enum TrustType {
  REVOCABLE = 'REVOCABLE',
  IRREVOCABLE = 'IRREVOCABLE',
}

export type CompanyType = TrustType | CorporateType;

export type CompanyTypeInput = {
  type: TrustType | CorporateType;
};

export class Company implements ToObject {
  private readonly companyType: CompanyType;

  constructor(companyType: CompanyType) {
    this.companyType = companyType;
  }

  static create(companyType: CompanyTypeInput): Company {
    try {
      const { type } = companyType;

      if (!(Object.values(CorporateType).includes(type) || Object.values(TrustType).includes(type))) {
        throw new ValidationError(ValidationErrorEnum.INVALID_TYPE, 'companyType');
      }
      return new Company(type);
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, 'companyType');
    }
  }

  toObject(): CompanyTypeInput {
    return {
      type: this.companyType,
    };
  }
}

export class CompanyName implements ToObject {
  private readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  static create(companyNameInput: CompanyNameInput): CompanyName {
    try {
      const { name } = companyNameInput;

      return new CompanyName(name);
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.EMPTY_VALUE, 'companyName');
    }
  }

  toObject(): CompanyNameInput {
    return {
      name: this.name,
    };
  }

  getInitials(): string {
    const name = this.name
      .replace(/\+/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    let initials = name.slice(0, 1).toUpperCase();
    const words = name.split(' ');

    if (words[1]) {
      initials += words[1].slice(0, 1).toUpperCase();
    }
    return initials;
  }

  getLabel(): string {
    return this.name;
  }
}

export type CompanyNameInput = {
  name: string;
};

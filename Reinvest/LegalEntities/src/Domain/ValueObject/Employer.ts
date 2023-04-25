import { Path } from 'LegalEntities/Domain/ValueObject/Document';
import { Id } from 'LegalEntities/Domain/ValueObject/Id';
import { ValidationError, ValidationErrorEnum } from 'LegalEntities/Domain/ValueObject/TypeValidators';

export type EmployerInput = {
  industry: string;
  nameOfEmployer: string;
  title: string;
};

export class Employer {
  private nameOfEmployer: string;
  private title: string;
  private industry: string;

  constructor(nameOfEmployer: string, title: string, industry: string) {
    this.nameOfEmployer = nameOfEmployer;
    this.title = title;
    this.industry = industry;
  }

  static create(input: EmployerInput) {
    try {
      const { nameOfEmployer, title, industry } = input;

      if (!nameOfEmployer || !title || !industry) {
        throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, 'employer');
      }

      return new Employer(nameOfEmployer, title, industry);
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, 'employer');
    }
  }

  toObject(): EmployerInput {
    return {
      nameOfEmployer: this.nameOfEmployer,
      title: this.title,
      industry: this.industry,
    };
  }
}

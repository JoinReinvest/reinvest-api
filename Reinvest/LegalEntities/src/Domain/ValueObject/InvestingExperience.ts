import { ToObject } from 'LegalEntities/Domain/ValueObject/ToObject';
import { ValidationError, ValidationErrorEnum } from 'LegalEntities/Domain/ValueObject/TypeValidators';

export enum InvestingExperienceType {
  NO_EXPERIENCE = 'NO_EXPERIENCE',
  SOME_EXPERIENCE = 'SOME_EXPERIENCE',
  VERY_EXPERIENCED = 'VERY_EXPERIENCED',
  EXPERT = 'EXPERT',
}

export type InvestingExperienceInput = {
  experience: InvestingExperienceType;
};

export class InvestingExperience implements ToObject {
  protected type: InvestingExperienceType;

  constructor(type: InvestingExperienceType) {
    this.type = type;
  }

  static create(rawStatement: InvestingExperienceInput): InvestingExperience {
    const { experience } = rawStatement;

    if (!Object.values(InvestingExperienceType).includes(experience)) {
      throw new ValidationError(ValidationErrorEnum.INVALID_TYPE, 'employmentStatus', experience);
    }

    return new InvestingExperience(experience);
  }

  toObject(): InvestingExperienceInput {
    return {
      experience: this.type,
    };
  }
}

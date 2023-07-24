import { ToObject } from 'LegalEntities/Domain/ValueObject/ToObject';
import { ValidationError, ValidationErrorEnum } from 'LegalEntities/Domain/ValueObject/TypeValidators';

export enum DomicileType {
  CITIZEN = 'CITIZEN',
  GREEN_CARD = 'GREEN_CARD',
  VISA = 'VISA',
}

export type GreenCardInput = {
  birthCountry: string;
  citizenshipCountry: string;
};

export type VisaInput = {
  birthCountry: string;
  citizenshipCountry: string;
  visaType: string;
};

export type DomicileInput = {
  type: DomicileType;
  forGreenCard?: GreenCardInput;
  forVisa?: VisaInput;
};

export enum SimplifiedDomicileType {
  CITIZEN = 'CITIZEN',
  RESIDENT = 'RESIDENT',
}

export type SimplifiedDomicileInput = {
  type: SimplifiedDomicileType;
};

export abstract class Domicile implements ToObject {
  static create(domicile: DomicileInput): Domicile {
    try {
      const { type, forGreenCard, forVisa } = domicile;
      switch (type) {
        case DomicileType.CITIZEN:
          return new USCitizen();
        case DomicileType.GREEN_CARD:
          const { birthCountry, citizenshipCountry } = forGreenCard as GreenCardInput;

          return new GreenCardResident(birthCountry, citizenshipCountry);
        case DomicileType.VISA:
          const { birthCountry: birth, citizenshipCountry: citizenship, visaType } = forVisa as VisaInput;

          return new VisaResident(birth, citizenship, visaType);
        default:
          throw new ValidationError(ValidationErrorEnum.INVALID_TYPE, type);
      }
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.EMPTY_VALUE, 'domicile');
    }
  }

  toObject(): any {
    throw new Error('Cannot use Domicile abstract class!');
  }
}

export class USCitizen extends Domicile implements ToObject {
  toObject(): DomicileInput {
    return {
      type: DomicileType.CITIZEN,
    };
  }
}

export class GreenCardResident extends Domicile implements ToObject {
  private birthCountry: string;
  private citizenshipCountry: string;

  constructor(birthCountry: string, citizenshipCountry: string) {
    super();
    this.birthCountry = birthCountry;
    this.citizenshipCountry = citizenshipCountry;
  }

  toObject(): DomicileInput {
    return {
      type: DomicileType.GREEN_CARD,
      forGreenCard: {
        birthCountry: this.birthCountry,
        citizenshipCountry: this.citizenshipCountry,
      },
    };
  }
}

export class VisaResident extends Domicile implements ToObject {
  private birthCountry: string;
  private citizenshipCountry: string;
  private visaType: string;

  constructor(birthCountry: string, citizenshipCountry: string, visaType: string) {
    super();
    this.birthCountry = birthCountry;
    this.citizenshipCountry = citizenshipCountry;
    this.visaType = visaType;
  }

  toObject(): DomicileInput {
    return {
      type: DomicileType.VISA,
      forVisa: {
        birthCountry: this.birthCountry,
        citizenshipCountry: this.citizenshipCountry,
        visaType: this.visaType,
      },
    };
  }
}

export class SimplifiedDomicile implements ToObject {
  private readonly type: SimplifiedDomicileType;

  constructor(type: SimplifiedDomicileType) {
    this.type = type;
  }

  static create(domicile: SimplifiedDomicileInput): SimplifiedDomicile {
    try {
      let { type } = domicile;

      // @ts-ignore
      if (type === 'GREEN_CARD' || type === 'VISA') {
        type = SimplifiedDomicileType.RESIDENT; // backward compatibility
      }

      if (!Object.values(SimplifiedDomicileType).includes(type)) {
        throw new ValidationError(ValidationErrorEnum.WRONG_TYPE, 'domicile');
      }

      return new SimplifiedDomicile(type);
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.EMPTY_VALUE, 'domicile');
    }
  }

  toObject(): SimplifiedDomicileInput {
    return {
      type: this.type,
    };
  }
}

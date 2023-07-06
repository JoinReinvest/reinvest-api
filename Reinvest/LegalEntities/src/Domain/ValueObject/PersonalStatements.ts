import { ToObject } from 'LegalEntities/Domain/ValueObject/ToObject';
import { ValidationError, ValidationErrorEnum } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { DateTime } from 'Money/DateTime';

export enum PersonalStatementType {
  FINRAMember = 'FINRAMember',
  TradingCompanyStakeholder = 'TradingCompanyStakeholder',
  Politician = 'Politician',
  AccreditedInvestor = 'AccreditedInvestor',
  TermsAndConditions = 'TermsAndConditions',
  PrivacyPolicy = 'PrivacyPolicy',
}

export type ForFINRA = {
  name: string;
};
export type ForPolitician = {
  description: string;
};

export type ForStakeholder = {
  tickerSymbols: string[];
};

export enum AccreditedInvestorStatements {
  I_AM_AN_ACCREDITED_INVESTOR = 'I_AM_AN_ACCREDITED_INVESTOR',
  I_AM_NOT_EXCEEDING_10_PERCENT_OF_MY_NET_WORTH_OR_ANNUAL_INCOME = 'I_AM_NOT_EXCEEDING_10_PERCENT_OF_MY_NET_WORTH_OR_ANNUAL_INCOME',
}

export type ForAccreditedInvestor = {
  statement: AccreditedInvestorStatements;
};

export enum TermsAndConditionsStatements {
  I_HAVE_READ_AND_AGREE_TO_THE_REINVEST_TERMS_AND_CONDITIONS = 'I_HAVE_READ_AND_AGREE_TO_THE_REINVEST_TERMS_AND_CONDITIONS',
}

export type ForTermsAndConditions = {
  statement: TermsAndConditionsStatements;
  date?: string;
};

export enum PrivacyPolicyStatements {
  I_HAVE_READ_AND_AGREE_TO_THE_REINVEST_PRIVACY_POLICY = 'I_HAVE_READ_AND_AGREE_TO_THE_REINVEST_PRIVACY_POLICY',
}

export type ForPrivacyPolicy = {
  statement: PrivacyPolicyStatements;
  date?: string;
};

export type PersonalStatementInput = {
  type: PersonalStatementType;
  forAccreditedInvestor?: ForAccreditedInvestor;
  forFINRA?: ForFINRA;
  forPolitician?: ForPolitician;
  forPrivacyPolicy?: ForPrivacyPolicy;
  forStakeholder?: ForStakeholder;
  forTermsAndConditions?: ForTermsAndConditions;
};

export abstract class PersonalStatement implements ToObject {
  protected type: PersonalStatementType;

  constructor(type: PersonalStatementType) {
    this.type = type;
  }

  static create(rawStatement: PersonalStatementInput): PersonalStatement {
    const { type, forFINRA, forStakeholder, forAccreditedInvestor, forPolitician, forTermsAndConditions, forPrivacyPolicy } = rawStatement;
    try {
      switch (type) {
        case PersonalStatementType.FINRAMember:
          const { name } = forFINRA as ForFINRA;

          return new FINRAMemberStatement(name);
        case PersonalStatementType.Politician:
          const { description } = forPolitician as ForPolitician;

          return new PoliticianStatement(description);
        case PersonalStatementType.TradingCompanyStakeholder:
          const { tickerSymbols } = forStakeholder as ForStakeholder;

          return new TradingCompanyStakeholderStatement(tickerSymbols);
        case PersonalStatementType.AccreditedInvestor:
          const { statement } = forAccreditedInvestor as ForAccreditedInvestor;

          return new AccreditedInvestorStatement(statement);
        case PersonalStatementType.TermsAndConditions:
          const { statement: termsAndConditionsStatement, date: termsAndConditionsDate } = forTermsAndConditions as ForTermsAndConditions;
          const agreeDateOfTC = !termsAndConditionsDate ? DateTime.now().toDate() : DateTime.from(termsAndConditionsDate).toDate();

          return new TermsAndConditionsStatement(termsAndConditionsStatement, agreeDateOfTC);
        case PersonalStatementType.PrivacyPolicy:
          const { statement: privacyPolicyStatement, date: privacyPolicyDate } = forPrivacyPolicy as ForPrivacyPolicy;
          const agreeDateOfPP = !privacyPolicyDate ? DateTime.now().toDate() : DateTime.from(privacyPolicyDate).toDate();

          return new PrivacyPolicyStatement(privacyPolicyStatement, agreeDateOfPP);
        default:
          throw new ValidationError(ValidationErrorEnum.INVALID_TYPE, type);
      }
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.EMPTY_VALUE, 'statement', error.message);
    }
  }

  isType(type: PersonalStatementType): boolean {
    return this.type === type;
  }

  getType(): PersonalStatementType {
    return this.type;
  }

  isTheSameType(statement: PersonalStatement): boolean {
    return statement.isType(this.type);
  }

  toObject(): PersonalStatementInput {
    throw new Error('You can not use an abstract class directly');
  }

  getDetails(): string[] {
    throw new Error('You can not use an abstract class directly');
  }
}

export class FINRAMemberStatement extends PersonalStatement implements ToObject {
  private name: string;

  constructor(name: string) {
    super(PersonalStatementType.FINRAMember);
    this.name = name;
  }

  toObject(): PersonalStatementInput {
    return {
      type: this.type,
      forFINRA: {
        name: this.name,
      },
    };
  }

  getDetails(): string[] {
    return [this.name];
  }
}

export class TradingCompanyStakeholderStatement extends PersonalStatement implements ToObject {
  private tickerSymbols: string[];

  constructor(tickerSymbols: string[]) {
    super(PersonalStatementType.TradingCompanyStakeholder);
    this.tickerSymbols = tickerSymbols;
  }

  toObject(): PersonalStatementInput {
    return {
      type: this.type,
      forStakeholder: {
        tickerSymbols: this.tickerSymbols,
      },
    };
  }

  getDetails(): string[] {
    return this.tickerSymbols;
  }
}

export class PoliticianStatement extends PersonalStatement implements ToObject {
  private description: string;

  constructor(description: string) {
    super(PersonalStatementType.Politician);
    this.description = description;
  }

  toObject(): PersonalStatementInput {
    return {
      type: this.type,
      forPolitician: {
        description: this.description,
      },
    };
  }

  getDetails(): string[] {
    return [this.description];
  }
}

export class AccreditedInvestorStatement extends PersonalStatement implements ToObject {
  private statement: AccreditedInvestorStatements;

  constructor(statement: AccreditedInvestorStatements) {
    super(PersonalStatementType.AccreditedInvestor);
    this.statement = statement;
  }

  toObject(): PersonalStatementInput {
    return {
      type: this.type,
      forAccreditedInvestor: {
        statement: this.statement,
      },
    };
  }

  getDetails(): string[] {
    return [this.statement];
  }
}

class TermsAndConditionsStatement extends PersonalStatement implements ToObject {
  private statement: TermsAndConditionsStatements;
  private agreeDate: Date;

  constructor(statement: TermsAndConditionsStatements, agreeDate: Date) {
    super(PersonalStatementType.TermsAndConditions);
    this.statement = statement;
    this.agreeDate = agreeDate;
  }

  toObject(): PersonalStatementInput {
    return {
      type: this.type,
      forTermsAndConditions: {
        statement: this.statement,
        date: this.agreeDate.toISOString(),
      },
    };
  }

  getDetails(): string[] {
    return [this.statement, this.agreeDate.toISOString()];
  }
}

class PrivacyPolicyStatement extends PersonalStatement implements ToObject {
  private statement: PrivacyPolicyStatements;
  private agreeDate: Date;

  constructor(statement: PrivacyPolicyStatements, agreeDate: Date) {
    super(PersonalStatementType.PrivacyPolicy);
    this.statement = statement;
    this.agreeDate = agreeDate;
  }

  toObject(): PersonalStatementInput {
    return {
      type: this.type,
      forPrivacyPolicy: {
        statement: this.statement,
        date: this.agreeDate.toISOString(),
      },
    };
  }

  getDetails(): string[] {
    return [this.statement, this.agreeDate.toISOString()];
  }
}

import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";
import {ValidationError} from "LegalEntities/Domain/ValueObject/TypeValidators";

export enum PersonalStatementType {
    FINRAMember = "FINRAMember",
    TradingCompanyStakeholder = "TradingCompanyStakeholder",
    Politician = "Politician",
    AccreditedInvestor = "AccreditedInvestor"
}

export type ForFINRA = {
    name: string,
};
export type ForPolitician = {
    description: string,
};

export type ForStakeholder = {
    tickerSymbols: string[]
};

export enum AccreditedInvestorStatements {
    I_AM_AN_ACCREDITED_INVESTOR = "I_AM_AN_ACCREDITED_INVESTOR",
    I_AM_NOT_EXCEEDING_10_PERCENT_OF_MY_NET_WORTH_OR_ANNUAL_INCOME = "I_AM_NOT_EXCEEDING_10_PERCENT_OF_MY_NET_WORTH_OR_ANNUAL_INCOME"
};

export type ForAccreditedInvestor = {
    statement: AccreditedInvestorStatements
};

export type PersonalStatementInput = {
    type: PersonalStatementType,
    forFINRA?: ForFINRA,
    forPolitician?: ForPolitician,
    forStakeholder?: ForStakeholder,
    forAccreditedInvestor?: ForAccreditedInvestor
}

export abstract class PersonalStatement implements ToObject {
    protected type: PersonalStatementType;

    constructor(type: PersonalStatementType) {
        this.type = type;
    }

    static create(rawStatement: PersonalStatementInput): PersonalStatement {
        const {type, forFINRA, forStakeholder, forAccreditedInvestor, forPolitician} = rawStatement;
        try {
            switch (type) {
                case PersonalStatementType.FINRAMember:
                    const {name} = forFINRA as ForFINRA;
                    return new FINRAMemberStatement(name);
                case PersonalStatementType.Politician:
                    const {description} = forPolitician as ForPolitician;
                    return new PoliticianStatement(description);
                case PersonalStatementType.TradingCompanyStakeholder:
                    const {tickerSymbols} = forStakeholder as ForStakeholder;
                    return new TradingCompanyStakeholderStatement(tickerSymbols);
                case PersonalStatementType.AccreditedInvestor:
                    const {statement} = forAccreditedInvestor as ForAccreditedInvestor;
                    return new AccreditedInvestorStatement(statement);
                default:
                    throw new ValidationError("Wrong domicile type");
            }
        } catch (error: any) {
            throw new ValidationError('Missing statement details');
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
        throw new Error("You can not use an abstract class directly");
    }

    getDetails(): string[] {
        throw new Error("You can not use an abstract class directly");
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
                name: this.name
            }
        }
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
                tickerSymbols: this.tickerSymbols
            }
        }
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
                description: this.description
            }
        }
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
                statement: this.statement
            }
        }
    }

    getDetails(): string[] {
        return [this.statement];
    }
}
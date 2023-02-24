import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";
import {EnumString} from "LegalEntities/Domain/ValueObject/TypeValidators";

export type PersonalStatementInput = {
    type: "FINRAMember" | "TradingCompanyStakeholder" | "Politician",
    forFINRA?: {
        name: string,
    }
    forPolitician?: {
        description: string,
    },
    forStakeholder?: {
        tickerSymbol: [string]
    }
}

export class PersonalStatementType extends EnumString {
    constructor(value: string) {
        super(value, ["FINRAMember", "TradingCompanyStakeholder", "Politician"]);
    }
}


export class PersonalStatement implements ToObject {

    static create(rawStatement: PersonalStatementInput): PersonalStatement {
        return new PersonalStatement();
    }

    toObject(): PersonalStatementInput {
        return {
            type: 'Politician',
        }
    }
}

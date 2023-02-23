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

export class PersonalStatement {

    static create(rawStatement: PersonalStatementInput): PersonalStatement {
        return new PersonalStatement();
    }
}
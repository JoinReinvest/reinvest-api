export type DomicileInput = {
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

export class Domicile {
    static create(domicile: DomicileInput): Domicile {
        return new Domicile();
    }
}
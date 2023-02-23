const schema = `
    #graphql
    input PersonName {
        firstName: String!
        middleName: String
        lastName: String!
    }

    enum DomicileType {
        CITIZEN
        GREEN_CARD
        VISA
    }

    input GreenCardInput {
        birthCountry: String!,
        citizenshipCountry: String!
    }

    input VisaInput {
        birthCountry: String!,
        citizenshipCountry: String!
        visaType: String!
    }
    
    """
    An investor statement of domicile type. 
    Choose the right one and add details depending on the chosen type
    """
    input DomicileInput {
        type: DomicileType!
        forGreenCard: GreenCardInput
        forVisa: VisaInput
    }

    input SSNInput {
        value: String!
    }

    input AddressInput {
        addressLine1: String!
        addressLine2: String
        city: String!
        zip: String!
        country: String!
        state: String!
    }

    type Address {
        addressLine1: String
        addressLine2: String
        city: String
        zip: String
        country: String
        state: String
    }

    input DollarInput {
        inCents: Int! @constraint(min: 0),
        formatted: String
    }

    type Dollar {
        inCents: Int
        display: String
    }

    enum AccountType {
        INDIVIDUAL
        CORPORATE
        TRUST
    }

    enum StatementType {
        FINRAMember
        TradingCompanyStakeholder
        Politician
    }

    input TradingCompanyStakeholderInput {
        tickerSymbol: [String!]!
    }

    input FINRAStatementInput {
        name: String!
    }
    input PoliticianStatementInput {
        description: String!
    }

    """
    An investor statements for:
    - being a FINRA member
    - politician
    - public trading company stakholder
    Choose type and add details depending on the chosen type
    """
    input StatementInput {
        type: StatementType!
        forFINRA: FINRAStatementInput
        forPolitician: PoliticianStatementInput
        forStakeholder: TradingCompanyStakeholderInput
    }
`;
export const Shared = {
    typeDefs: schema,
}


const schema = `
    #graphql
    input PersonName {
        firstName: String! @constraint(minLength: 1)
        middleName: String
        lastName: String! @constraint(minLength: 1)
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
        ssn: String!
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
        AccreditedInvestor
    }

    input TradingCompanyStakeholderInput {
        tickerSymbols: [String!]!
    }

    input FINRAStatementInput {
        name: String!
    }
    input PoliticianStatementInput {
        description: String!
    }

    enum AccreditedInvestorStatement {
        I_AM_AN_ACCREDITED_INVESTOR
        I_AM_NOT_EXCEEDING_10_PERCENT_OF_MY_NET_WORTH_OR_ANNUAL_INCOME
    }

    "Only one of these statements can be valid"
    input AccreditedInvestorInput {
        statement: AccreditedInvestorStatement!
    }

    """
    An investor statements for:
    - being a FINRA member
    - politician
    - public trading company stakeholder
    Choose type and add details depending on the chosen type
    """
    input StatementInput {
        type: StatementType!
        forFINRA: FINRAStatementInput
        forPolitician: PoliticianStatementInput
        forStakeholder: TradingCompanyStakeholderInput
        forAccreditedInvestor: AccreditedInvestorInput
    }
`;
export const Shared = {
    typeDefs: schema,
}


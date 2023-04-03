const schema = `
    #graphql
    input PersonName {
        firstName: String! @constraint(minLength: 1)
        middleName: String
        lastName: String! @constraint(minLength: 1)
    }

    input DateOfBirthInput {
        dateOfBirth: ISODate!
    }

    input EmailInput {
        email: EmailAddress!
    }

    input LegalNameInput {
        name: String!
    }

    enum DomicileType {
        CITIZEN
        GREEN_CARD
        VISA
    }

    type Domicile {
        type: DomicileType
        birthCountry: String
        citizenshipCountry: String
        visaType: String
    }

    input GreenCardInput {
        birthCountry: String!
        citizenshipCountry: String!
    }

    input VisaInput {
        birthCountry: String!
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
        "The valid SSN is 9 digits in format 'XXX-XX-XXXX'"
        ssn: String! @constraint(pattern: "^[0-9]{3}-[0-9]{2}-[0-9]{4}$")
    }

    input EINInput {
        ein: String!
    }

    type EIN {
        ein: String
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
        inCents: Int! @constraint(min: 0)
        formatted: String
    }

    type Dollar {
        inCents: Int
        display: String
    }

    enum DraftAccountType {
        INDIVIDUAL
        CORPORATE
        TRUST
    }

    enum AccountType {
        INDIVIDUAL
        CORPORATE
        TRUST
        BENEFICIARY
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

    type Statement {
        type: StatementType,
        details: [String]
    }
`;
export const Shared = {
    typeDefs: schema,
}


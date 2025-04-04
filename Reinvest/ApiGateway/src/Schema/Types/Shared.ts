const schema = `
    #graphql
    input PersonName {
        firstName: String! @constraint(minLength: 1)
        middleName: String
        lastName: String! @constraint(minLength: 1)
    }

    type PersonNameType {
        firstName: String
        middleName: String
        lastName: String
    }

    input DateOfBirthInput {
        dateOfBirth: ISODate!
    }

    type DateOfBirth {
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

    enum SimplifiedDomicileType {
        CITIZEN
        RESIDENT
    }

    input SimplifiedDomicileInput {
        type: SimplifiedDomicileType!
    }

    type SimplifiedDomicile {
        type: SimplifiedDomicileType
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
        TermsAndConditions
        PrivacyPolicy
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

    enum TermsAndConditionsStatement {
        I_HAVE_READ_AND_AGREE_TO_THE_REINVEST_TERMS_AND_CONDITIONS
    }

    input TermsAndConditionsInput {
        statement: TermsAndConditionsStatement!
    }

    enum PrivacyPolicyStatement {
        I_HAVE_READ_AND_AGREE_TO_THE_REINVEST_PRIVACY_POLICY
    }

    input PrivacyPolicyInput {
        statement: PrivacyPolicyStatement!
    }

    """
    An investor statements for:
    - being a FINRA member
    - politician
    - public trading company stakeholder
    - accredited investor
    - terms and conditions
    - privacy policy
    Choose type and add details depending on the chosen type
    """
    input StatementInput {
        type: StatementType!
        forFINRA: FINRAStatementInput
        forPolitician: PoliticianStatementInput
        forStakeholder: TradingCompanyStakeholderInput
        forAccreditedInvestor: AccreditedInvestorInput
        forTermsAndConditions: TermsAndConditionsInput
        forPrivacyPolicy: PrivacyPolicyInput
    }

    type Statement {
        type: StatementType,
        details: [String]
    }

    input USDInput {
        value: Money!,
    }

    type USD {
        value: Money!,
        formatted: String
    }

    enum AgreementStatus {
        WAITING_FOR_SIGNATURE
        SIGNED
    }

    type AgreementParagraph {
        lines: [String!]!
        isCheckedOption: Boolean
    }

    type AgreementSection {
        header: String
        paragraphs: [AgreementParagraph!]!
    }

    enum SubscriptionAgreementType {
        DIRECT_DEPOSIT
        RECURRING_INVESTMENT
    }

    type SubscriptionAgreement {
        id: ID!
        type: SubscriptionAgreementType!
        status: AgreementStatus!
        createdAt: ISODateTime!
        signedAt: ISODateTime
        content: [AgreementSection!]!
    }

    """
    If not provided, default pagination is page: 0, perPage: 10
    """
    input Pagination {
        page: Int! = 0
        perPage: Int! = 10
    }
`;
export const Shared = {
  typeDefs: schema,
};

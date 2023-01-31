const schema = `
    #graphql
    input PersonName {
        firstName: String!
        middleName: String
        lastName: String!
    }

    enum Domicile {
        CITIZEN
        RESIDENT
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
`;
export const Shared = {
    typeDefs: schema,
}


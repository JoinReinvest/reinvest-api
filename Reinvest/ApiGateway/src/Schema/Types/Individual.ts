import {SessionContext} from "ApiGateway/index";

const schema = `
    #graphql
    type Individual {
        firstName: String
        middleName: String
        lastName: String
        dateOfBirth: String
        domicile: String
        address: Address
    }

    type Query {
        getIndividual: Individual
    }
`;

const individualMockResponse = {
    firstName: "mŁukasz",
    middleName: "mJohn",
    lastName: "mBlacksmith",
    dateOfBirth: "m22/11/2000",
    domicile: "mUS. Citizen",
    address: {
        addressLine1: "mRiver Street",
        addressLine2: "m170/10",
        city: "mNew York",
        zip: "m90210",
        country: "UmSA",
        state: "mNew York"
    }
}

const resolvers = {
    Query: {
        getIndividual: (parent: any, args: undefined, context: SessionContext) => individualMockResponse
    },
};

export const Individual = {
    typeDefs: schema,
    resolvers
}

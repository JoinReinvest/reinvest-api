import {makeExecutableSchema} from "@graphql-tools/schema";

const schema = `
    #graphql
    type Individual {
        id: ID!
        firstName: String
        middleName: String
        lastName: String
        isCompleted: Boolean
        dateOfBirth: String
    }
    
    type Query {
        getIndividual(profileId: String): Individual
    }
    
`;

const resolvers = {
    Query: {

    }
};

export const Individual = makeExecutableSchema({
    typeDefs: schema,
    resolvers
})

import {makeExecutableSchema} from "@graphql-tools/schema";

const schema = `
    #graphql
    type Query {
        hello: Boolean
    }
`;

export const Hello = makeExecutableSchema({
    typeDefs: schema,
    resolvers: {
        Query: {
            hello: () => true
        }
    }
})
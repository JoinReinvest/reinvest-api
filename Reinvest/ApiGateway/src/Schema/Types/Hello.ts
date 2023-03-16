import {makeExecutableSchema} from "@graphql-tools/schema";

const schema = `
    #graphql
    type Query {
        """ Just say hello """
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
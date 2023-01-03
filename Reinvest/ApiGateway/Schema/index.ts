import {addMocksToSchema} from "@graphql-tools/mock";
import {SchemaMocks} from "./SchemaMocks";
import {EmailAddress} from "./Scalars/EmailAddress";
import {mergeTypeDefs} from "@graphql-tools/merge";
import {makeExecutableSchema} from "@graphql-tools/schema";
import {Hello} from "./Types/Hello";
import {Profile} from "./Types/Profile";

const typeDefinitions = [
    EmailAddress.schema,
    Hello.schema,
    Profile.schema,
];

const resolvers = {
    ...EmailAddress.resolvers,
    Mutation: {
        ...Profile.mutations,
    },
    Query: {
        ...Profile.queries
    },
};

const typeDefs = mergeTypeDefs(typeDefinitions);

export default addMocksToSchema({
    schema: makeExecutableSchema({
        typeDefs,
        resolvers
    }),
    mocks: SchemaMocks,
    preserveResolvers: true
});
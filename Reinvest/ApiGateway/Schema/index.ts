import {addMocksToSchema} from "@graphql-tools/mock";
import {SchemaMocks} from "./SchemaMocks";
import {profileDefinitions} from "./Types/Profile";
import {EmailAddress} from "./Scalars/EmailAddress";
import {mergeTypeDefs} from "@graphql-tools/merge";
import {makeExecutableSchema} from "@graphql-tools/schema";

const typeDefinitions = [
    EmailAddress.schema,
    profileDefinitions,
];
const resolvers = {
    ...EmailAddress.resolvers
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
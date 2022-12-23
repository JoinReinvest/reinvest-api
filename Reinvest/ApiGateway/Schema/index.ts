import {addMocksToSchema} from "@graphql-tools/mock";
import {SchemaMocks} from "./SchemaMocks";
import {profileDefinitions} from "./Types/Profile";
import {EmailAddress} from "./Scalars/EmailAddress";
import {mergeTypeDefs} from "@graphql-tools/merge";
import {makeExecutableSchema} from "@graphql-tools/schema";
import {ProfileMutations} from "./Mutations/createProfile";

const typeDefinitions = [
    EmailAddress.schema,
    profileDefinitions,
    ProfileMutations.schema,
];
const resolvers = {
    Mutation: {
        ...ProfileMutations.resolvers,
    },
    Query: {
        // Profile: () => ({
        //     id: 'uuid',
        //     email: 'test@reit.com',
        //     avatarUrl: 'http://some-url.com',
        // })
    },
    ...EmailAddress.resolvers,
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
import {mergeTypeDefs} from "@graphql-tools/merge";
import {addMocksToSchema} from "@graphql-tools/mock";
import {makeExecutableSchema, mergeSchemas} from "@graphql-tools/schema";

import {EmailAddress} from "ApiGateway/Schema/Scalars/EmailAddress";
import {SchemaMocks} from "ApiGateway/Schema/SchemaMocks";
import {Hello} from "ApiGateway/Schema/Types/Hello";
import {Profile} from "ApiGateway/Schema/Types/Profile";
import {Individual} from "ApiGateway/Schema/Types/Individual";
import {ProfileStitching} from "ApiGateway/Schema/Stitching/ProfileStitching";

const typeDefinitions = [
    // EmailAddress.schema,
    // Hello.schema,
    // Profile.schema,
    // Individual.schema,
    // ProfileStiCtching.schema
];

const resolvers = {
    // ...EmailAddress.resolvers,
    // ...ProfileStitching.resolvers,
    // Mutation: {
        // ...Profile.mutations,
    // },
    // Query: {
        // ...Profile.queries,
    // },
};

const executableSchemas = [
    // EmailAddress,
    // Profile,
    // Individual,
    ProfileStitching
];

// const typeDefs = mergeTypeDefs(typeDefinitions);
// console.log({typeDefs})
const schema = mergeSchemas({
    schemas: executableSchemas
})

export default addMocksToSchema({
    schema,
    mocks: SchemaMocks,
    preserveResolvers: true,
});

/*
 makeExecutableSchema({
        typeDefs,
        resolvers,
    }),
 */

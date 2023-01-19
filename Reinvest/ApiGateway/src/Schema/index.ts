import {mergeResolvers, mergeTypeDefs} from "@graphql-tools/merge";
import {addMocksToSchema} from "@graphql-tools/mock";
import {mergeSchemas} from "@graphql-tools/schema";
import {EmailAddress} from "ApiGateway/Schema/Scalars/EmailAddress";
import {SchemaMocks} from "ApiGateway/Schema/SchemaMocks";
import {Hello} from "ApiGateway/Schema/Types/Hello";
import {Profile} from "ApiGateway/Schema/Types/Profile";
import {Individual} from "ApiGateway/Schema/Types/Individual";
import {ProfileStitcher} from "ApiGateway/Schema/Stitching/ProfileStitcher";

const executableSchemas = [
    EmailAddress,
    Hello,
];

const nonExecutableSchemas = mergeTypeDefs([
    Profile.typeDefs,
    Individual.typeDefs,
]);

const nonExecutableResolvers = mergeResolvers([
    Profile.resolvers,
    Individual.resolvers,
]);

let schema = mergeSchemas({
    schemas: executableSchemas,
    typeDefs: nonExecutableSchemas,
    resolvers: nonExecutableResolvers
})

const stitches = [
    ProfileStitcher
];

for (let stitch of stitches) {
    schema = stitch(schema);
}

export default schema;

// export default addMocksToSchema({
//     schema,
//     mocks: SchemaMocks,
//     preserveResolvers: true,
// });

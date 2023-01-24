import {mergeResolvers, mergeTypeDefs} from "@graphql-tools/merge";
import {mergeSchemas} from "@graphql-tools/schema";
import {EmailAddress} from "ApiGateway/Schema/Scalars/EmailAddress";
import {Hello} from "ApiGateway/Schema/Types/Hello";
import {Profile} from "ApiGateway/Schema/Types/Profile";
import {Individual} from "ApiGateway/Schema/Types/Individual";
import {ProfileStitcher} from "ApiGateway/Schema/Stitching/ProfileStitcher";
import {Account} from "ApiGateway/Schema/Types/Account";
import {ProfileCompletionStatus} from "ApiGateway/Schema/Types/ProfileCompletionStatus";
import {PhoneNumberVerification} from "ApiGateway/Schema/Types/Identity";
import {constraintDirective, constraintDirectiveTypeDefs} from "graphql-constraint-directive";
import {Address} from "ApiGateway/Schema/Types/Address";

const executableSchemas = [
    EmailAddress,
    Hello,
];

const nonExecutableTypeDefs = mergeTypeDefs([
    constraintDirectiveTypeDefs,
    Address.typeDefs,
    Account.typeDefs,
    ProfileCompletionStatus.typeDefs,
    Profile.typeDefs,
    PhoneNumberVerification.typeDefs,
    Individual.typeDefs,
]);

const nonExecutableResolvers = mergeResolvers([
    Account.resolvers,
    ProfileCompletionStatus.resolvers,
    Profile.resolvers,
    PhoneNumberVerification.resolvers,
    Individual.resolvers,
]);

let schema = mergeSchemas({
    schemas: executableSchemas,
    typeDefs: nonExecutableTypeDefs,
    resolvers: nonExecutableResolvers,
})

const stitches = [
    constraintDirective(),
    ProfileStitcher,
];

for (let stitch of stitches) {
    schema = stitch(schema);
}

export default schema;


import {mergeResolvers, mergeTypeDefs} from "@graphql-tools/merge";
import {mergeSchemas} from "@graphql-tools/schema";
import {EmailAddress} from "ApiGateway/Schema/Scalars/EmailAddress";
import {Hello} from "ApiGateway/Schema/Types/Hello";
import {Profile} from "ApiGateway/Schema/Types/Profile";
import {ProfileStitcher} from "ApiGateway/Schema/Stitching/ProfileStitcher";
import {Account} from "ApiGateway/Schema/Types/Account";
import {PhoneNumberVerification} from "ApiGateway/Schema/Types/Identity";
import {constraintDirective, constraintDirectiveTypeDefs} from "graphql-constraint-directive";
import {DateScalar} from "ApiGateway/Schema/Scalars/DateScalar";
import {Shared} from "ApiGateway/Schema/Types/Shared";
import {DocumentTypes} from "ApiGateway/Schema/Types/DocumentTypes";
import {DraftAccount} from "ApiGateway/Schema/Types/DraftAccount";

const executableSchemas = [
    EmailAddress,
    DateScalar,
    Hello,
];

const nonExecutableTypeDefs = mergeTypeDefs([
    constraintDirectiveTypeDefs,
    Shared.typeDefs,
    Account.typeDefs,
    ...DraftAccount.typeDefs,
    Profile.typeDefs,
    PhoneNumberVerification.typeDefs,
    DocumentTypes.typeDefs,
]);

const nonExecutableResolvers = mergeResolvers([
    Account.resolvers,
    DraftAccount.resolvers,
    Profile.resolvers,
    PhoneNumberVerification.resolvers,
    DocumentTypes.resolvers,
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


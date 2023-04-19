import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { mergeSchemas } from '@graphql-tools/schema';
import { DateScalar } from 'ApiGateway/Schema/Scalars/DateScalar';
import { EmailAddress } from 'ApiGateway/Schema/Scalars/EmailAddress';
import { ProfileStitcher } from 'ApiGateway/Schema/Stitching/ProfileStitcher';
import { Account } from 'ApiGateway/Schema/Types/Account';
import { DocumentTypes } from 'ApiGateway/Schema/Types/DocumentTypes';
import { DraftAccount } from 'ApiGateway/Schema/Types/DraftAccount';
import { Hello } from 'ApiGateway/Schema/Types/Hello';
import { PhoneNumberVerification } from 'ApiGateway/Schema/Types/Identity';
import { Profile } from 'ApiGateway/Schema/Types/Profile';
import { Shared } from 'ApiGateway/Schema/Types/Shared';
import { VerificationSchema } from 'ApiGateway/Schema/Types/Verification';
import { constraintDirective, constraintDirectiveTypeDefs } from 'graphql-constraint-directive';

const executableSchemas = [EmailAddress, DateScalar, Hello];

const nonExecutableTypeDefs = mergeTypeDefs([
  constraintDirectiveTypeDefs,
  Shared.typeDefs,
  Account.typeDefs,
  ...DraftAccount.typeDefs,
  Profile.typeDefs,
  PhoneNumberVerification.typeDefs,
  DocumentTypes.typeDefs,
  VerificationSchema.typeDefs,
]);

const nonExecutableResolvers = mergeResolvers([
  Account.resolvers,
  DraftAccount.resolvers,
  Profile.resolvers,
  PhoneNumberVerification.resolvers,
  DocumentTypes.resolvers,
  VerificationSchema.resolvers,
]);

let schema = mergeSchemas({
  schemas: executableSchemas,
  typeDefs: nonExecutableTypeDefs,
  resolvers: nonExecutableResolvers,
});

const stitches = [constraintDirective(), ProfileStitcher];

for (const stitch of stitches) {
  schema = stitch(schema);
}

export default schema;

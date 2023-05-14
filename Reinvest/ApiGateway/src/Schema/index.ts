import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { mergeSchemas } from '@graphql-tools/schema';
import { DateScalar } from 'ApiGateway/Schema/Scalars/DateScalar';
import { EmailAddress } from 'ApiGateway/Schema/Scalars/EmailAddress';
import { FileName } from 'ApiGateway/Schema/Scalars/FileName';
import { Money } from 'ApiGateway/Schema/Scalars/Money';
import { ProfileStitcher } from 'ApiGateway/Schema/Stitching/ProfileStitcher';
import { Account } from 'ApiGateway/Schema/Types/Account';
import { AccountStats } from 'ApiGateway/Schema/Types/AccountStats';
import { Configuration } from 'ApiGateway/Schema/Types/Configuration';
import { DocumentTypes } from 'ApiGateway/Schema/Types/DocumentTypes';
import { DraftAccount } from 'ApiGateway/Schema/Types/DraftAccount';
import { Hello } from 'ApiGateway/Schema/Types/Hello';
import { PhoneNumberVerification } from 'ApiGateway/Schema/Types/Identity';
import { Investments } from 'ApiGateway/Schema/Types/Investments';
import { Notification } from 'ApiGateway/Schema/Types/Notification';
import { Profile } from 'ApiGateway/Schema/Types/Profile';
import { RecurringInvestments } from 'ApiGateway/Schema/Types/RecurringInvestments';
import { Shared } from 'ApiGateway/Schema/Types/Shared';
import { VerificationSchema } from 'ApiGateway/Schema/Types/Verification';
import { Withdrawals } from 'ApiGateway/Schema/Types/Withdrawals';
import { constraintDirective, constraintDirectiveTypeDefs } from 'graphql-constraint-directive';

const executableSchemas = [EmailAddress, FileName, DateScalar, Money, Hello];

const nonExecutableTypeDefs = mergeTypeDefs([
  constraintDirectiveTypeDefs,
  Shared.typeDefs,
  Account.typeDefs,
  ...DraftAccount.typeDefs,
  Profile.typeDefs,
  PhoneNumberVerification.typeDefs,
  DocumentTypes.typeDefs,
  VerificationSchema.typeDefs,
  Investments.typeDefs,
  RecurringInvestments.typeDefs,
  Configuration.typeDefs,
  AccountStats.typeDefs,
  Notification.typeDefs,
  Withdrawals.typeDefs,
]);

const nonExecutableResolvers = mergeResolvers([
  Account.resolvers,
  DraftAccount.resolvers,
  Profile.resolvers,
  PhoneNumberVerification.resolvers,
  DocumentTypes.resolvers,
  VerificationSchema.resolvers,
  Investments.resolvers,
  RecurringInvestments.resolvers,
  Configuration.resolvers,
  AccountStats.resolvers,
  Notification.resolvers,
  Withdrawals.resolvers,
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

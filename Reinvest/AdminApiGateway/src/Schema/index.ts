import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { mergeSchemas } from '@graphql-tools/schema';
import { AdminVerificationSchema } from 'AdminApiGateway/Schema/Types/AdminVerification';
import { DividendsSchema } from 'AdminApiGateway/Schema/Types/Dividends';
import { Shared } from 'AdminApiGateway/Schema/Types/Shared';
import { UsersSchema } from 'AdminApiGateway/Schema/Types/Users';
import { Withdrawals } from 'AdminApiGateway/Schema/Types/Withdrawals';
import { DateScalar } from 'ApiGateway/Schema/Scalars/DateScalar';
import { EmailAddress } from 'ApiGateway/Schema/Scalars/EmailAddress';
import { Money } from 'ApiGateway/Schema/Scalars/Money';
import { constraintDirective, constraintDirectiveTypeDefs } from 'graphql-constraint-directive';
import { PortfolioSchema } from 'Reinvest/AdminApiGateway/src/Schema/Types/Portfolio';

import { DocumentTypes } from './Types/DocumentTypes';

const executableSchemas = [EmailAddress, DateScalar, Money];
const nonExecutableTypeDefs = mergeTypeDefs([
  constraintDirectiveTypeDefs,
  Shared.typeDefs,
  AdminVerificationSchema.typeDefs,
  DividendsSchema.typeDefs,
  PortfolioSchema.typeDefs,
  DocumentTypes.typeDefs,
  Withdrawals.typeDefs,
  UsersSchema.typeDefs,
  // InvestmentsSchema.typeDefs,
]);
const nonExecutableResolvers = mergeResolvers([
  AdminVerificationSchema.resolvers,
  DividendsSchema.resolvers,
  PortfolioSchema.resolvers,
  DocumentTypes.resolvers,
  Withdrawals.resolvers,
  UsersSchema.resolvers,
  // InvestmentsSchema.resolvers,
]);

let schema = mergeSchemas({
  schemas: executableSchemas,
  typeDefs: nonExecutableTypeDefs,
  resolvers: nonExecutableResolvers,
});

const stitches = [constraintDirective()];

for (const stitch of stitches) {
  schema = stitch(schema);
}

export default schema;

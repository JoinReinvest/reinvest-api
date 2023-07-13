import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { mergeSchemas } from '@graphql-tools/schema';
import { AdminVerificationSchema } from 'AdminApiGateway/Schema/Types/AdminVerification';
import { DividendsSchema } from 'AdminApiGateway/Schema/Types/Dividends';
import { Shared } from 'AdminApiGateway/Schema/Types/Shared';
import { DateScalar } from 'ApiGateway/Schema/Scalars/DateScalar';
import { EmailAddress } from 'ApiGateway/Schema/Scalars/EmailAddress';
import { constraintDirective, constraintDirectiveTypeDefs } from 'graphql-constraint-directive';
import { PortfolioSchema } from 'Reinvest/AdminApiGateway/src/Schema/Types/Portfolio';

import { DocumentTypes } from './Types/DocumentTypes';
import { Withdrawals } from 'AdminApiGateway/Schema/Types/Withdrawals';
import { Money } from 'ApiGateway/Schema/Scalars/Money';

const executableSchemas = [EmailAddress, DateScalar, Money];
const nonExecutableTypeDefs = mergeTypeDefs([
  constraintDirectiveTypeDefs,
  Shared.typeDefs,
  AdminVerificationSchema.typeDefs,
  DividendsSchema.typeDefs,
  PortfolioSchema.typeDefs,
  DocumentTypes.typeDefs,
  Withdrawals.typeDefs,
]);
const nonExecutableResolvers = mergeResolvers([
  AdminVerificationSchema.resolvers,
  DividendsSchema.resolvers,
  PortfolioSchema.resolvers,
  DocumentTypes.resolvers,
  Withdrawals.resolvers,
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

import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { mergeSchemas } from '@graphql-tools/schema';
import { AdminVerificationSchema } from 'AdminApiGateway/Schema/Types/AdminVerification';
import { DividendsSchema } from 'AdminApiGateway/Schema/Types/Dividends';
import { Shared } from 'AdminApiGateway/Schema/Types/Shared';
import { DateScalar } from 'ApiGateway/Schema/Scalars/DateScalar';
import { EmailAddress } from 'ApiGateway/Schema/Scalars/EmailAddress';
import { constraintDirective, constraintDirectiveTypeDefs } from 'graphql-constraint-directive';

const executableSchemas = [EmailAddress, DateScalar];
const nonExecutableTypeDefs = mergeTypeDefs([constraintDirectiveTypeDefs, Shared.typeDefs, AdminVerificationSchema.typeDefs, DividendsSchema.typeDefs]);
const nonExecutableResolvers = mergeResolvers([AdminVerificationSchema.resolvers, DividendsSchema.resolvers]);

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

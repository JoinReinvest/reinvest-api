import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { mergeSchemas } from '@graphql-tools/schema';
import { DateScalar } from 'AdminApiGateway/Schema/Scalars/DateScalar';
import { EmailAddress } from 'AdminApiGateway/Schema/Scalars/EmailAddress';
import { Shared } from 'AdminApiGateway/Schema/Types/Shared';
import { constraintDirective, constraintDirectiveTypeDefs } from 'graphql-constraint-directive';
import { AdminVerificationSchema } from 'AdminApiGateway/Schema/Types/AdminVerification';

const executableSchemas = [EmailAddress, DateScalar];
const nonExecutableTypeDefs = mergeTypeDefs([constraintDirectiveTypeDefs, Shared.typeDefs, AdminVerificationSchema.typeDefs]);
const nonExecutableResolvers = mergeResolvers([AdminVerificationSchema.resolvers]);

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

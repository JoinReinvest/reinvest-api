import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';

const EmailAddressSchema = `
    #graphql
    scalar EmailAddress
`;

const EmailAddressResolver = new GraphQLScalarType({
  name: 'EmailAddress',
  description: 'A valid email address',
  serialize: value => value,
  parseValue: value => value,
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('The value must be string');
    }

    return ast.value;
  },
});

export const EmailAddress = makeExecutableSchema({
  typeDefs: EmailAddressSchema,
  resolvers: {
    EmailAddress: EmailAddressResolver,
  },
});

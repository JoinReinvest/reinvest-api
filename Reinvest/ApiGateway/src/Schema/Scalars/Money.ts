import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';

const MoneySchema = `
    #graphql
    scalar Money
`;

const MoneyResolver = new GraphQLScalarType({
  name: 'Money',
  description: 'Money value in format 0.00',
  serialize: value => value,
  parseValue: value => value,
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('The value must be string');
    }

    if (!new RegExp('^\\d+\\.\\d{2}$').test(ast.value)) {
      throw new GraphQLError('The Money must be in format 0.00');
    }

    return ast.value;
  },
});

export const Money = makeExecutableSchema({
  typeDefs: MoneySchema,
  resolvers: {
    Money: MoneyResolver,
  },
});

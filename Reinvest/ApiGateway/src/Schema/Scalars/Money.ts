import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';

const MoneySchema = `
    #graphql
    scalar Money
`;

const MoneyResolver = new GraphQLScalarType({
  name: 'Money',
  description: 'Money value as integer. 1=$0.01, 1000 = $10.00, 10000000 = $100,000.00',
  serialize: value => value,
  parseValue: value => parseInt(value as string, 10),
  parseLiteral: ast => {
    if (ast.kind !== Kind.INT) {
      throw new GraphQLError('The value must be an integer');
    }

    const value = parseInt(ast.value, 10);

    if (value < 1) {
      throw new GraphQLError('The Money must be bigger than 0');
    }

    return value;
  },
});

export const Money = makeExecutableSchema({
  typeDefs: MoneySchema,
  resolvers: {
    Money: MoneyResolver,
  },
});

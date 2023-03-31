import { makeExecutableSchema } from '@graphql-tools/schema';
import DateTime from 'date-and-time';
import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';

const DateSchema = `
    #graphql
    scalar ISODate
`;

function isValidISODate(value: string) {
  if (!DateTime.isValid(value, 'YYYY-MM-DD')) {
    throw new GraphQLError('The value format must be YYYY-MM-DD');
  }
}

const DateResolver = new GraphQLScalarType({
  name: 'ISODate',
  description: 'Date in format YYYY-MM-DD',
  serialize(date: string): string {
    // BE -> FE
    return date;
  },

  parseValue(value: string): string {
    // FE (variable) -> BE
    isValidISODate(value);

    return value;
  },

  parseLiteral(ast): string | never {
    // FE (hardcoded) -> BE
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('The value must be string');
    }

    isValidISODate(ast.value);

    return ast.value;
  },
});

export const DateScalar = makeExecutableSchema({
  typeDefs: DateSchema,
  resolvers: {
    ISODate: DateResolver,
  },
});

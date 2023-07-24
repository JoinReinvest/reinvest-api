import { makeExecutableSchema } from '@graphql-tools/schema';
import dayjs from 'dayjs';
import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';

const DateSchema = `
    #graphql
    scalar ISODate
    scalar ISODateTime
`;

function isValidISODate(value: string) {
  if (!dayjs(value, 'YYYY-MM-DD').isValid()) {
    throw new GraphQLError('The value format must be YYYY-MM-DD');
  }
}

function isValidISOTime(value: string) {
  if (!dayjs(value, 'YYYY-MM-DDThh:mm:ss').isValid()) {
    throw new GraphQLError('The value format must be YYYY-MM-DDThh:mm:ss');
  }
}

const DateResolver = new GraphQLScalarType({
  name: 'ISODate',
  description: 'Date in format YYYY-MM-DD',

  // @ts-ignore
  serialize(date: string): string {
    // BE -> FE
    return date;
  },
  // @ts-ignore
  parseValue(value: string): string {
    // FE (variable) -> BE
    isValidISODate(value);

    return value;
  },
  // @ts-ignore
  parseLiteral(ast): string | never {
    // FE (hardcoded) -> BE
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('The value must be string');
    }

    isValidISODate(ast.value);

    return ast.value;
  },
});
const DateTimeResolver = new GraphQLScalarType({
  name: 'ISODateTime',
  description: 'DateTime in format YYYY-MM-DDThh:mm:ss in UTC+0',

  // @ts-ignore
  serialize(date: string): string {
    // BE -> FE
    return date;
  },
  // @ts-ignore
  parseValue(value: string): string {
    // FE (variable) -> BE
    isValidISOTime(value);

    return value;
  },
  // @ts-ignore
  parseLiteral(ast): string | never {
    // FE (hardcoded) -> BE
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('The value must be string');
    }

    isValidISOTime(ast.value);

    return ast.value;
  },
});
export const DateScalar = makeExecutableSchema({
  typeDefs: DateSchema,
  resolvers: {
    ISODate: DateResolver,
    ISODateTime: DateTimeResolver,
  },
});

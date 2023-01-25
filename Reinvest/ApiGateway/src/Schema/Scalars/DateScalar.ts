import {GraphQLError, GraphQLScalarType, Kind} from 'graphql';
import DateTime from 'date-and-time';
import {makeExecutableSchema} from "@graphql-tools/schema";

const DateSchema = `
    #graphql
    scalar USDate
`;

function isValidUSDate(value: string) {
    if (!DateTime.isValid(value, 'MM/DD/YYYY')) {
        throw new GraphQLError("The value format must be MM/DD/YYYY");
    }
}

const DateResolver = new GraphQLScalarType({
    name: 'USDate',
    description: 'Date in format MM/DD/YYYY',

    // @ts-ignore
    serialize(date: string): string { // BE -> FE
        return date;
    },
    // @ts-ignore
    parseValue(value: string): string { // FE (variable) -> BE
        isValidUSDate(value);
        return value;
    },
    // @ts-ignore
    parseLiteral(ast): string | never { // FE (hardcoded) -> BE
        if (ast.kind !== Kind.STRING) {
            throw new GraphQLError("The value must be string");
        }

        isValidUSDate(ast.value);

        return ast.value;
    },


});

export const DateScalar = makeExecutableSchema({
    typeDefs: DateSchema,
    resolvers: {
        USDate: DateResolver,
    },
});
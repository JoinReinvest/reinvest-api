import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';

const FileNameSchema = `
    #graphql
    scalar FileName
`;

const FileNameResolver = new GraphQLScalarType({
  name: 'FileName',
  description: 'Image or pdf filename with extension. Example: image.jpg, document.pdf',
  serialize: value => value,
  parseValue: value => value,
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('The value must be string');
    }

    if (!new RegExp('.*.(pdf|jpeg|jpg|png)$', 'i').test(ast.value)) {
      throw new GraphQLError('The filename must contains extension: .pdf, .jpeg, .jpg, .png');
    }

    return ast.value;
  },
});

export const FileName = makeExecutableSchema({
  typeDefs: FileNameSchema,
  resolvers: {
    FileName: FileNameResolver,
  },
});

import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [`http://localhost:3000/api`]: {
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`,
        },
      },
    },
  ],
  generates: {
    'src/generated/schema.graphql': {
      plugins: ['schema-ast'],
    },
  },
};

export default config;

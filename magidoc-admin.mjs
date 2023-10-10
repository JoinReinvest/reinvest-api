export default {
  introspection: {
    type: 'sdl',
    paths: ['./src/generated/schema.graphql'],
  },
  website: {
    output: './admin-docs',
    template: 'carbon-multi-page',
    options: {
      appTitle: 'Reinvest Admin API',
      pages: [
        {
          title: 'Introduction',
          content: `
# API
It is official Reinvest Admin API documentation.
`,
        },
      ],
      queryGenerationFactories: {
        'ISODateTime': 'YYYY-MM-DDThh:mm:ss',
        'ISODate': 'YYYY-MM-DD',
        'Money': '1000',
        'numberOfLinks_Int_NotNull_min_1_max_10': '3',
        'EmailAddress': 'test@gmail.com'
      }
    },
  },
};

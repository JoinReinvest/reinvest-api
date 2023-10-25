export default {
  introspection: {
    type: 'sdl',
    paths: ['./src/generated/schema.graphql'],
  },
  website: {
    template: 'carbon-multi-page',
    options: {
      appTitle: 'Reinvest API',
      pages: [
        {
          title: 'Introduction',
          content: `
# API
It is official Reinvest API documentation.
`,
        },
      ],
      queryGenerationFactories: {
        'ISODateTime': 'YYYY-MM-DDThh:mm:ss',
        'ISODate': 'YYYY-MM-DD',
        'Money': '1000',
        'numberOfLinks_Int_NotNull_min_1_max_10': '3',
        'EmailAddress': 'test@gmail.com',
        'FileName': 'test.jpg',
        'firstName_String_NotNull_minLength_1': 'John',
        'lastName_String_NotNull_minLength_1': 'Doe',
      }
    },
  },
};

const schema = `
    #graphql
    type Individual {
        id: ID!
        firstName: String
        middleName: String
        lastName: String
        isCompleted: Boolean
        dateOfBirth: String
    }

    type Query {
        getIndividual(profileId: String): Individual
    }

`;

const resolvers = {
    Query: {
        getIndividual: (parent, {profileId}) => ({
            id: 'xxx',
            firstName: `${profileId}-xx`,
            lastName: "this is the last name"
        })
    }
};

export const Individual = {
    typeDefs: schema,
    resolvers
}

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
        getIndividual: Individual
    }

    type Mutation {
        setIndividual(
            firstName: String
            middleName: String
            lastName: String
        ): Individual
    }

`;

const resolvers = {
    // Individual: (parent, args, {profileId}) => ({
    //     id: 'xxx',
    //     firstName: `${profileId}-xx`,
    //     lastName: JSON.stringify(args)
    // }),
    Query: {
        getIndividual: (parent, args, {profileId}) => ({
            id: 'xxx',
            firstName: `${profileId}-xx`,
            lastName: JSON.stringify(args)
        })
    },
    Mutation: {
        setIndividual: (parent, {
            firstName,
            middleName,
            lastName,
        }) => {
            return {
                firstName,
                middleName,
                lastName,
            }
        }
    }
};

export const Individual = {
    typeDefs: schema,
    resolvers
}

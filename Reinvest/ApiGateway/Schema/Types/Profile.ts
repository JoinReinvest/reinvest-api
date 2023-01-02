const schema = `
    #graphql
    type Profile {
        id: ID!
        "The name of user"
        email: EmailAddress
        avatarUrl: String
    }
    
    type Query {
        getProfile(userId: String): Profile
    }
    
    type Mutation {
        createProfile(userId: String): Profile
    }
`;

const resolvers = {
    createProfile: (parent, {userId}, context) => {
        // const profileController = new CreateProfileController();
        // const uuid = profileController.call(userId);

        return {
            id: 'uuid',
            email: 'test',
            avatarUrl: 'kowalski',
        }
    },

}

export const Profile = {
    schema,
    resolvers
};

//
// const resolvers = {
//     Query: {
//         hello: (parent, args, contextValue, info) => {
//             console.log(contextValue.lambdaEvent.requestContext.authorizer);
//
//             return 'this is test';
//         }
//     },
//     Mutation: {
//         login: (parent, args, context) => {
//             console.log({parent, args, context});
//             return {
//                 ID: 'uuid',
//                 name: args.email,
//                 surname: 'kowalski',
//                 address: 'Factory street'
//             }
//         },
//     },
// };
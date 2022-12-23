export const profileDefinitions = `
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
`;

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
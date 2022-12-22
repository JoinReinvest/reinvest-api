export const profileDefinitions = `
    #graphql
    type Profile {
        id: ID!
        "The name of user"
        name: EmailAddress
        surname: String
        address: String
    }

    type Query {
        hello: String
    }
    type Mutation {
        login(email: EmailAddress): Profile
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
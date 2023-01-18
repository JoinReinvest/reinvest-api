import {mergeSchemas} from "@graphql-tools/schema";
import {Profile} from "ApiGateway/Schema/Types/Profile";
import {Individual} from "ApiGateway/Schema/Types/Individual";

const extendedProfile = `
    #graphql
    type ProfileTest {
        details: Individual
    }
`;


const schema = mergeSchemas({
    schemas: [extendedProfile],
    // resolvers: mergeInfo => ({
    //     Profile: {
    //         details: {
    //             fragment: `fragment ProfileFragment on Profile {id}`,
    //             resolve: (parent: any, args: any, context: any, info: any) => {
    //                 const profileId: string = parent.id;
    //                 return mergeInfo.delegate(
    //                     'query',
    //                     'details',
    //                     {profileId},
    //                     context,
    //                     info
    //                 )
    //             }
    //         }
    //     }
    // })
    resolvers: mergeInfo => ({
        ProfileTest: {
            details: (root, args, context, info) => mergeInfo.delegate(
                'query',
                'greeting',
                args,
                context,
                info
            )
        }
    })
})


export const ProfileStitching = schema;

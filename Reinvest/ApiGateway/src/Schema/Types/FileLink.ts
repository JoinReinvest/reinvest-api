import {LegalEntities} from "LegalEntities/index";
import {SessionContext} from "ApiGateway/index";

const schema = `
    #graphql
    input FileLinkInput {
        id: String!
    }

    type FileLink {
        url: String
        id: String
    }

    type Mutation {
        createDocumentsFileLinks(
            numberOfLinks: Int! @constraint(min:1, max: 10)
        ): [FileLink]

        createAvatarFileLink: FileLink
    }
`;

export const FileLink = {
    typeDefs: schema,
    resolvers: {
        Mutation: {
            createDocumentsFileLinks: async (parent: any,
                                             {numberOfLinks}: { numberOfLinks: number },
                                             {profileId, modules}: SessionContext
            ) => {
                const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
                return api.createDocumentsFileLinks(numberOfLinks, profileId);
            },
            createAvatarFileLink: async (parent: any,
                                         args: any,
                                         {profileId, modules}: SessionContext
            ) => {
                const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
                return api.createAvatarFileLink(profileId);
            },
        },
    }
}


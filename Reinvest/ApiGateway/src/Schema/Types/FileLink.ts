import {LegalEntities} from "LegalEntities/index";
import {SessionContext} from "ApiGateway/index";
import LegalEntitiesApiType = LegalEntities.LegalEntitiesApiType;

const schema = `
    #graphql
    input FileLinkInput {
        url: String!
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
                const api = modules.getApi<LegalEntitiesApiType>(LegalEntities);
                return api.createDocumentsFileLinks(numberOfLinks, profileId);
            },
            createAvatarFileLink: async (parent: any,
                                         args: any,
                                         {profileId, modules}: SessionContext
            ) => {
                const api = modules.getApi<LegalEntitiesApiType>(LegalEntities);
                return api.createAvatarFileLink(profileId);
            },
        },
    }
}


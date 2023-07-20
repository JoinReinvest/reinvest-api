import { AdminSessionContext } from 'AdminApiGateway/index';
import { GraphQLError } from 'graphql';
import { Identity } from 'Identity/index';
import { LegalEntities } from 'LegalEntities/index';

const schema = `
    #graphql

    type User {
        profileId: ID
        email: String
        createdAt: String
        isBanned: Boolean
    }

    enum AccountType {
        INDIVIDUAL
        CORPORATE
        TRUST
        BENEFICIARY
    }

    type AccountOverview {
        id: ID
        label:String
        type: AccountType
        isBanned: Boolean
    }

    enum BannedObjectType {
        PROFILE
        COMPANY
        STAKEHOLDER
    }

    enum BannedType {
        PROFILE
        ACCOUNT
    }

    type Banned {
        banId: ID!
        profileId: ID!
        accountId: ID
        bannedObject: BannedObjectType
        banType: BannedType
        ssnEin: String
        reason: String
        dateCreated: String
        status: String
        label: String
    }

    type Query {
        listUsers(pagination: Pagination = {page: 0, perPage: 30}): [User]
        getUserAccounts(profileId: ID!): [AccountOverview]
        listBanned(pagination: Pagination = {page: 0, perPage: 30}): [Banned]
    }

    type Mutation {
        """
        Ban user profile/individual account
        """
        banUser(profileId: ID!, reason: String!): Boolean
        """
        Ban corporate/trust account
        """
        banCompanyAccount(accountId: ID!, reason: String!): Boolean
        """
        Unban banned entity
        """
        unban(banId: ID!): Boolean
    }
`;

export const UsersSchema = {
  typeDefs: schema,
  resolvers: {
    Query: {
      listUsers: async (parent: any, { pagination }: any, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Identity.ApiType>(Identity);

        return api.listUsers(pagination);
      },
      getUserAccounts: async (parent: any, { profileId }: any, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const identityApi = modules.getApi<Identity.ApiType>(Identity);
        const profile = await identityApi.getProfileByProfileId(profileId);

        if (!profile) {
          throw new GraphQLError('User profile not found');
        }

        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

        return (await api.getAccountsOverview(profileId)).map(account => ({
          ...account,
          isBanned: profile.isBannedAccount(account.id),
        }));
      },
      listBanned: async (parent: any, { pagination }: any, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

        return api.listBanned(pagination);
      },
    },
    Mutation: {
      banUser: async (parent: any, { profileId, reason }: any, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

        return api.banUser(profileId, reason);
      },
      banCompanyAccount: async (parent: any, { accountId, reason }: any, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

        return api.banAccount(accountId, reason);
      },
      unban: async (parent: any, { banId }: any, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

        return api.unban(banId);
      },
    },
  },
};

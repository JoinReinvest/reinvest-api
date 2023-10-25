import { AdminSessionContext } from 'AdminApiGateway/index';
import { JsonGraphQLError, SessionContext } from 'ApiGateway/index'
import { GraphQLError } from 'graphql';
import { Identity } from 'Identity/index';
import { LegalEntities } from 'LegalEntities/index';
import { ProfileResponse } from 'LegalEntities/Port/Api/GetProfileController'
import { UpdateProfileInput } from 'LegalEntities/UseCases/UpdateProfile'
import { Registration } from 'Registration/index'

const schema = `
    #graphql

    type ProfileDetails {
        firstName: String
        middleName: String
        lastName: String
        dateOfBirth: String
        domicile: Domicile
        address: Address
        ssn: String
        idScan: [DocumentFileLinkId]
        statements: [Statement]
        experience: Experience
    }
    
    enum Experience {
        NO_EXPERIENCE
        SOME_EXPERIENCE
        VERY_EXPERIENCED
        EXPERT
    }

    input ExperienceInput {
        experience: Experience
    }

    """
    An investor profile information.
    Returns data about investor details, accounts and notifications
    """
    type Profile {
        "The external, nice-looking profile ID"
        externalId: String
        "The name/label of the user"
        label: String
        isCompleted: Boolean
        details: ProfileDetails
    }

    input ProfileDetailsInput {
        "An investor name"
        name: PersonName
        "Date of Birth in format YYYY-MM-DD"
        dateOfBirth: DateOfBirthInput
        "Is the investor US. Citizen or US. Resident with Green Card or Visa"
        domicile: DomicileInput
        "A valid SSN number"
        ssn: SSNInput
        "Permanent address of an investor"
        address: AddressInput
        """
        ID scan can be provided in more then one document, ie. 2 scans of both sides of the ID.
        Required "id" provided in the @FileLink type from the @createDocumentsFileLinks mutation
        IMPORTANT: it removes previously uploaded id scan documents from s3 if the previous document ids are not listed in the request
        """
        idScan: [DocumentFileLinkInput]
        """
        FINRA, Politician, Trading company stakeholder, accredited investor, terms and conditions, privacy policy statements
        REQUIRED statements to complete the profile:
        - accredited investor
        - terms and conditions
        - privacy policy
        """
        statements: [StatementInput]
        "If an investor decided to remove one of the statements during onboarding"
        removeStatements: [StatementInput]
        investingExperience: ExperienceInput
        "Send this field if you want to finish the onboarding. In case of success verification, onboarding will be considered as completed"
        verifyAndFinish: Boolean
    }

    input UpdateProfileInput {
        """
        Important Note: KYC/AML reverification will be triggered
        An investor name
        """
        name: PersonName
        "Permanent address of an investor"
        address: AddressInput
        "Is the investor US. Citizen or US. Resident with Green Card or Visa"
        domicile: DomicileInput
        """
        Important Note: KYC/AML reverification will be triggered
        ID scan can be provided in more then one document, ie. 2 scans of both sides of the ID.
        Required "id" provided in the @FileLink type from the @createDocumentsFileLinks mutation
        IMPORTANT: it removes previously uploaded id scan documents from s3 if the previous document ids are not listed in the request
        """
        idScan: [DocumentFileLinkInput]
        investingExperience: ExperienceInput
        """
        FINRA, Politician, Trading company stakeholder, accredited investor, terms and conditions, privacy policy statements
        REQUIRED statements to complete the profile:
        - accredited investor
        - terms and conditions
        - privacy policy
        """
        statements: [StatementInput]
        "If an investor decided to remove one of the statements during onboarding"
        removeStatements: [StatementInput]
    }

    input UpdateProfileForVerificationInput {
        "An investor name"
        name: PersonName
        "Date of Birth in format YYYY-MM-DD"
        dateOfBirth: DateOfBirthInput
        "Is the investor US. Citizen or US. Resident with Green Card or Visa"
        domicile: DomicileInput
        "Permanent address of an investor"
        address: AddressInput
        """
        ID scan can be provided in more then one document, ie. 2 scans of both sides of the ID.
        Required "id" provided in the @FileLink type from the @createDocumentsFileLinks mutation
        IMPORTANT: it removes previously uploaded id scan documents from s3 if the previous document ids are not listed in the request
        """
        idScan: [DocumentFileLinkInput]
    }

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
        """Get user profile"""
        getProfile(profileId: ID!): Profile
        listUsers(pagination: Pagination = {page: 0, perPage: 30}): [User]
        getUserAccounts(profileId: ID!): [AccountOverview]
        listBanned(pagination: Pagination = {page: 0, perPage: 30}): [Banned]
    }

    type Mutation {
        """
        Update profile fields
        Important Note: Some fields can trigger KYC/AML reverification
        """
        updateProfile(input: UpdateProfileInput): Profile
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

type UpdateProfileForDetailsInput = {
    input: UpdateProfileInput;
};

export const UsersSchema = {
  typeDefs: schema,
  resolvers: {
    Query: {
        getProfile: async (parent: any, { profileId }: any, { isAdmin, modules }: AdminSessionContext): Promise<ProfileResponse> => {
            if (!isAdmin) {
                throw new GraphQLError('Access denied');
            }

            const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

            return api.getProfile(profileId);
        },
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
        updateProfile: async (parent: any, data: UpdateProfileForDetailsInput, { profileId, modules }: SessionContext): Promise<ProfileResponse> => {
            const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
            const { input } = data;
            const errors = await api.updateProfile(input, profileId);

            if (errors.length > 0) {
                throw new JsonGraphQLError(errors);
            }

            const registrationApi = modules.getApi<Registration.ApiType>(Registration);
            await registrationApi.synchronizeProfile(profileId);

            return api.getProfile(profileId);
        },
    },
  },
};

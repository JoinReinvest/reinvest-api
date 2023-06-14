import { JsonGraphQLError, SessionContext } from 'ApiGateway/index';
import { InvestmentAccounts } from 'InvestmentAccounts/index';
import { LegalEntities } from 'LegalEntities/index';
import { ProfileResponse } from 'LegalEntities/Port/Api/GetProfileController';
import { CompleteProfileInput } from 'LegalEntities/UseCases/CompleteProfile';

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

    type Query {
        """Get user profile"""
        getProfile: Profile
        """Returns list of account types that user can open"""
        listAccountTypesUserCanOpen: [AccountType]
    }

    type Mutation {
        """
        Profile onboarding mutation.
        Every field in the input can be requested separately.
        In case of any failure all changes in the request are not stored in the database.
        To finish onboarding send field 'verifyAndFinish'
        """
        completeProfileDetails(input: ProfileDetailsInput): Profile

        """
        Update profile fields
        Important Note: Some fields can trigger KYC/AML reverification
        """
        updateProfile(input: UpdateProfileInput): Profile
    }
`;

type CompleteProfileDetailsInput = {
  input: CompleteProfileInput;
};

export const Profile = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getProfile: async (parent: any, input: undefined, { profileId, modules }: SessionContext): Promise<ProfileResponse> => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

        return api.getProfile(profileId);
      },
      listAccountTypesUserCanOpen: async (parent: any, data: undefined, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<InvestmentAccounts.ApiType>(InvestmentAccounts);

        return api.listAccountTypesUserCanOpen(profileId);
      },
    },
    Mutation: {
      completeProfileDetails: async (parent: any, data: CompleteProfileDetailsInput, { profileId, modules }: SessionContext): Promise<ProfileResponse> => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const { input } = data;
        const errors = await api.completeProfile(input, profileId);

        if (errors.length > 0) {
          throw new JsonGraphQLError(errors);
        }

        return api.getProfile(profileId);
      },

      updateProfile: async (parent: any, data: any, { profileId, modules }: SessionContext): Promise<ProfileResponse> => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const { input } = data;
        // const errors = await api.completeProfile(input, profileId);

        // if (errors.length > 0) {
        //   throw new JsonGraphQLError(errors);
        // }

        return api.getProfile(profileId);
      },
    },
  },
};

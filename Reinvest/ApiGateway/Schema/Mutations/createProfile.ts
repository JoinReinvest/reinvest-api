import ProfileService from "../../../InvestmentAccounts/ProfileService";
import CreateProfileController from "../../../InvestmentAccounts/Api/CreateProfileController";

export const schema = `
    #graphql
    type Mutation {
        createProfile(userId: String): Profile
    }
`;

const resolvers = {
    createProfile: (parent, {userId}, context) => {
        const profileController = new CreateProfileController();
        const uuid = profileController.call(userId);

        return {
            id: uuid,
            email: 'test',
            avatarUrl: 'kowalski',
        }
    },

}

export const ProfileMutations = {
    schema,
    resolvers
};
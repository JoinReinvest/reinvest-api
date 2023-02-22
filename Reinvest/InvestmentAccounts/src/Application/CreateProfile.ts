import {ProfileRepository} from "InvestmentAccounts/Infrastructure/Storage/Repository/ProfileRepository";
import Profile from "InvestmentAccounts/Domain/Profile";
import {ProfileException} from "InvestmentAccounts/Domain/ProfileException";

class CreateProfile {
    static getClassName = (): string => "CreateProfile";

    private readonly profileRepository: ProfileRepository;

    constructor(profileRepository: ProfileRepository) {
        this.profileRepository = profileRepository;
    }

    async execute(profileId: string) {
        const checkIfExists = await this.profileRepository.restore(profileId);
        if (checkIfExists !== null) {
            throw new ProfileException(`Profile ${profileId} already exists`);
        }

        const profile = Profile.create(profileId);
        const profileCreated = profile.initialize();

        await this.profileRepository.storeAndPublish([profileCreated], profile.getSnapshot());
        console.log(`Profile ${profileId} created`);
    }
}

export default CreateProfile;

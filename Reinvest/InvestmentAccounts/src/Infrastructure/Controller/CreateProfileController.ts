import {ProfileRepository} from "InvestmentAccounts/ProfileService";

export class CreateProfileController {
    public static getClassName = (): string => "CreateProfileController";
    private profileRepository: ProfileRepository;

    constructor(profileRepository: ProfileRepository) {
        this.profileRepository = profileRepository;
    }

    async execute(profileId: string, email: string): Promise<boolean> {

        return true;
    }

}
import CreateProfile from "InvestmentAccounts/Application/CreateProfile";

export class CreateProfileController {
    public static getClassName = (): string => "CreateProfileController";
    private createProfile: CreateProfile;

    constructor(createProfile: CreateProfile) {
        this.createProfile = createProfile;
    }

    async execute(profileId: string): Promise<boolean> {
        try {
            await this.createProfile.execute(profileId);
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
        return true;
    }

}
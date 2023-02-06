import {UserRepository} from "Identity/Adapter/Database/Repository/UserRepository";
import {ProfileService} from "Identity/Adapter/Profile/ProfileService";
import {CognitoService} from "Identity/Adapter/AWS/CognitoService";

export class UserRegistrationController {
    public static getClassName = (): string => "UserRegistrationController";
    private userRepository: UserRepository;
    private profileService: ProfileService;
    private cognitoService: CognitoService;

    constructor(userRepository: UserRepository, profileService: ProfileService, cognitoService: CognitoService) {
        this.userRepository = userRepository;
        this.profileService = profileService;
        this.cognitoService = cognitoService;
    }

    async registerUser(userId: string, email: string, isVerified: boolean, incentiveToken: string | null): Promise<boolean> {
        const profileId = await this.userRepository.createUser(userId, email, isVerified, incentiveToken);
        const isProfileCreated = await this.profileService.createProfile(profileId, email);
        if (isProfileCreated) {
            await this.cognitoService.setProfileAttribute(userId, profileId);
        }
        return true;
    }
}
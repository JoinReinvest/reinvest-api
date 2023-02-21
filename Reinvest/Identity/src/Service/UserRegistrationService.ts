import {UserRepository} from "Identity/Adapter/Database/Repository/UserRepository";
import {ProfileService} from "Identity/Adapter/Profile/ProfileService";
import {CognitoService} from "Identity/Adapter/AWS/CognitoService";
import {IdGeneratorInterface} from "IdGenerator/IdGenerator";

export class UserRegistrationService {
    public static getClassName = (): string => "UserRegistrationService";
    private userRepository: UserRepository;
    private profileService: ProfileService;
    private cognitoService: CognitoService;
    private idGenerator: IdGeneratorInterface;

    constructor(
        userRepository: UserRepository,
        profileService: ProfileService,
        cognitoService: CognitoService,
        idGenerator: IdGeneratorInterface
    ) {
        this.userRepository = userRepository;
        this.profileService = profileService;
        this.cognitoService = cognitoService;
        this.idGenerator = idGenerator;
    }

    async registerUser(userId: string, email: string, incentiveToken: string | null): Promise<boolean> {
        try {
            // check if user already exists
            let profileId = await this.userRepository.getUserProfileId(userId);

            if (profileId === null) {
                profileId = this.idGenerator.create();
                const id = this.idGenerator.create();
                const userIncentiveToken = await this.userRepository.generateUniqueIncentiveToken();
                await this.userRepository.registerUser(id, profileId, userIncentiveToken, userId, email, incentiveToken);
            }
            console.log({profileId});

            const isProfileCreated = await this.profileService.createProfile(profileId);
            try {
                await this.cognitoService.setProfileAttribute(userId, profileId); // TODO custom token cannot be updated!!
            } catch (error: any) {
                console.log('Cannot update profile id', error.message, error);
            }

            return true;
        } catch (error: any) {
            console.error(error.message);
            return false;
        }
    }
}
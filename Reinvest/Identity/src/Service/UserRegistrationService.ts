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
                console.log(`Creating user: ${userId}`);
                profileId = this.idGenerator.createUuid();
                const id = this.idGenerator.createUuid();
                const userIncentiveToken = await this.userRepository.generateUniqueIncentiveToken();
                await this.userRepository.registerUser(id, profileId, userIncentiveToken, userId, email, incentiveToken);
                console.log(`User created: ${userId} with profile id ${profileId}`);
            } else {
                console.log(`User ${userId} already exists with profile id ${profileId}`);
            }

            console.log(`Creating profile id ${profileId}`);
            await this.profileService.createProfile(profileId);

            // try {
            //     console.log(`Registering profile ${profileId} in Cognito for user ${userId}`);
            //     await this.cognitoService.setProfileAttribute(userId, profileId);
            //     console.log(`Profile ${profileId} for user ${userId} registered in Cognito`);
            // } catch (error: any) {
            //     console.log(`Cannot register profile ${profileId} for user ${userId} in Cognito: ${error.message}`);
            // }
            return true;
        } catch (error: any) {
            console.log(`[UserRegistrationService/registerUser] ${error.message}`);
            return false;
        }
    }
}
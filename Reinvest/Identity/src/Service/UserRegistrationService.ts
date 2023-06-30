import { CognitoService } from 'Identity/Adapter/AWS/CognitoService';
import { IncentiveTokenRepository } from 'Identity/Adapter/Database/Repository/IncentiveTokenRepository';
import { UserRepository } from 'Identity/Adapter/Database/Repository/UserRepository';
import { ProfileService } from 'Identity/Adapter/Profile/ProfileService';
import { IncentiveToken } from 'Identity/Domain/IncentiveToken';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { EventBus, storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';

export class UserRegistrationService {
  public static getClassName = (): string => 'UserRegistrationService';
  private userRepository: UserRepository;
  private profileService: ProfileService;
  private cognitoService: CognitoService;
  private idGenerator: IdGeneratorInterface;
  private incentiveTokenRepository: IncentiveTokenRepository;
  private eventBus: EventBus;

  constructor(
    userRepository: UserRepository,
    profileService: ProfileService,
    cognitoService: CognitoService,
    idGenerator: IdGeneratorInterface,
    incentiveTokenRepository: IncentiveTokenRepository,
    eventBus: EventBus,
  ) {
    this.userRepository = userRepository;
    this.profileService = profileService;
    this.cognitoService = cognitoService;
    this.idGenerator = idGenerator;
    this.incentiveTokenRepository = incentiveTokenRepository;
    this.eventBus = eventBus;
  }

  async registerUser(userId: string, email: string, incentiveToken: IncentiveToken | null): Promise<boolean> {
    try {
      // check if user already exists
      const profile = await this.userRepository.getUserProfile(userId);
      let profileId;

      if (profile === null) {
        console.log(`Creating user: ${userId}`);
        profileId = this.idGenerator.createUuid();
        const id = this.idGenerator.createUuid();
        const userIncentiveToken = await this.incentiveTokenRepository.generateUniqueIncentiveToken();
        await this.userRepository.registerUser(id, profileId, userIncentiveToken, userId, email, incentiveToken);
        console.log(`User created: ${userId} with profile id ${profileId}`);
      } else {
        console.log(`User ${userId} already exists with profile id ${profile.profileId}`);
        profileId = profile.profileId;
      }

      console.log(`Creating profile id ${profileId}`);
      await this.profileService.createProfile(profileId);
      await this.eventBus.publish(storeEventCommand(profileId, 'UserRegistered'));

      return true;
    } catch (error: any) {
      console.log(`[UserRegistrationService/registerUser] ${error.message}`);

      return false;
    }
  }
}

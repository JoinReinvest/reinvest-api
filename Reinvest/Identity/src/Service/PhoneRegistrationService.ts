import { PhoneRepository } from 'Identity/Adapter/Database/Repository/PhoneRepository';
import { UserRepository } from 'Identity/Adapter/Database/Repository/UserRepository';
import { OneTimeToken } from 'Identity/Domain/OneTimeToken';
import { PhoneNumber } from 'Identity/Domain/PhoneNumber';
import { UniqueTokenGeneratorInterface } from 'IdGenerator/UniqueTokenGenerator';

const TOPT_SIZE = 6;

export class PhoneRegistrationService {
  private userRepository: UserRepository;
  private phoneRepository: PhoneRepository;
  private uniqueTokenGenerator: UniqueTokenGeneratorInterface;

  constructor(userRepository: UserRepository, phoneRepository: PhoneRepository, uniqueTokenGenerator: UniqueTokenGeneratorInterface) {
    this.phoneRepository = phoneRepository;
    this.userRepository = userRepository;
    this.uniqueTokenGenerator = uniqueTokenGenerator;
  }

  public static getClassName = (): string => 'PhoneRegistrationService';

  async registerUnverifiedPhoneNumber(userId: string, phoneNumber: PhoneNumber): Promise<boolean> {
    try {
      const tokenValue = this.uniqueTokenGenerator.generateRandomString(TOPT_SIZE);
      const oneTimeToken = new OneTimeToken(userId, tokenValue, phoneNumber);

      return this.phoneRepository.storeToken(oneTimeToken);
    } catch (error: any) {
      console.log(error.message);

      return false;
    }
  }

  async verifyPhoneNumber(userId: string, phone: PhoneNumber, TOPTToken: string) {
    try {
      const oneTimeToken = await this.phoneRepository.findToken(userId, phone);
      console.log(oneTimeToken);
      const event = oneTimeToken.verifyToken(TOPTToken);

      return this.phoneRepository.applyEvent(event);
    } catch (error: any) {
      console.log(error.message);

      return false;
    }
  }
}

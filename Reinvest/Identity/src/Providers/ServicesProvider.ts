import { ContainerInterface } from 'Container/Container';
import { CognitoService } from 'Identity/Adapter/AWS/CognitoService';
import { IncentiveTokenRepository } from 'Identity/Adapter/Database/Repository/IncentiveTokenRepository';
import { PhoneRepository } from 'Identity/Adapter/Database/Repository/PhoneRepository';
import { UserRepository } from 'Identity/Adapter/Database/Repository/UserRepository';
import { ProfileService } from 'Identity/Adapter/Profile/ProfileService';
import { Identity } from 'Identity/index';
import { PhoneRegistrationService } from 'Identity/Service/PhoneRegistrationService';
import { UserRegistrationService } from 'Identity/Service/UserRegistrationService';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { UniqueTokenGenerator } from 'IdGenerator/UniqueTokenGenerator';

export class ServicesProvider {
  private config: Identity.Config;

  constructor(config: Identity.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container
      .addSingleton(UserRegistrationService, [UserRepository, ProfileService, CognitoService, IdGenerator, IncentiveTokenRepository])
      .addSingleton(PhoneRegistrationService, [UserRepository, PhoneRepository, UniqueTokenGenerator]);
  }
}

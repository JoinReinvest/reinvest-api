import { ContainerInterface } from 'Container/Container';
import { CognitoService } from 'Identity/Adapter/AWS/CognitoService';
import { IncentiveTokenRepository } from 'Identity/Adapter/Database/Repository/IncentiveTokenRepository';
import { UserRepository } from 'Identity/Adapter/Database/Repository/UserRepository';
import { Identity } from 'Identity/index';
import { BanController } from 'Identity/Port/Api/BanController';
import { IncentiveTokenController } from 'Identity/Port/Api/IncentiveTokenController';
import { PhoneController } from 'Identity/Port/Api/PhoneController';
import { ProfileController } from 'Identity/Port/Api/ProfileController';
import { ProfileHashController } from 'Identity/Port/Api/ProfileHashController'
import { UserRegistrationController } from 'Identity/Port/Api/UserRegistrationController';
import { PhoneRegistrationService } from 'Identity/Service/PhoneRegistrationService';
import { UserRegistrationService } from 'Identity/Service/UserRegistrationService';

export class PortsProvider {
  private config: Identity.Config;

  constructor(config: Identity.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addAsValue('webAppUrl', this.config.webAppUrl);
    //controllers
    container
      .addSingleton(ProfileHashController)
      .addSingleton(ProfileController, [UserRepository, CognitoService])
      .addSingleton(PhoneController, [PhoneRegistrationService, CognitoService])
      .addSingleton(UserRegistrationController, [UserRegistrationService])
      .addSingleton(BanController, [UserRepository])
      .addSingleton(IncentiveTokenController, [IncentiveTokenRepository, 'webAppUrl']);
  }
}

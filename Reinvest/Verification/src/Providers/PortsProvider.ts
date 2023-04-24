import { ContainerInterface } from 'Container/Container';
import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';
import { Verification } from 'Verification/index';
import { VerifyAccount } from 'Verification/IntegrationLogic/UseCase/VerifyAccount';
import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';

export class PortsProvider {
  private config: Verification.Config;

  constructor(config: Verification.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(VerifyAccount, [RegistrationService, VerifierRepository]);
  }
}

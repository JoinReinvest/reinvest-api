import { ContainerInterface } from 'Container/Container';
import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';
import { Verification } from 'Verification/index';
import { VerifyAccount } from 'Verification/IntegrationLogic/UseCase/VerifyAccount';
import { VerifierExecutor } from 'Verification/IntegrationLogic/Verifier/VerifierExecutor';
import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';
import { AdminVerificationActions } from 'Verification/Port/Api/AdminVerificationActions';
import { UserVerificationActions } from 'Verification/Port/Api/UserVerificationActions';

export class PortsProvider {
  private config: Verification.Config;

  constructor(config: Verification.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(AdminVerificationActions, [VerifierRepository]);
    container.addSingleton(UserVerificationActions, [VerifierRepository]);
    container.addSingleton(VerifyAccount, [RegistrationService, VerifierRepository, VerifierExecutor]);
  }
}

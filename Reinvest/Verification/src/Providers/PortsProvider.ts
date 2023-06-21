import { ContainerInterface } from 'Container/Container';
import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';
import { Verification } from 'Verification/index';
import { VerifyAccount } from 'Verification/IntegrationLogic/UseCase/VerifyAccount';
import { VerifierExecutor } from 'Verification/IntegrationLogic/Verifier/VerifierExecutor';
import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';
import { AdminVerificationActions } from 'Verification/Port/Api/AdminVerificationActions';
import { NorthCapitalVerificationEvents } from 'Verification/Port/Api/NorthCapitalVerificationEvents';
import { PrincipalApprovals } from 'Verification/Port/Api/PrincipalApprovals';
import { UserVerificationActions } from 'Verification/Port/Api/UserVerificationActions';
import { VerifierService } from 'Verification/IntegrationLogic/Service/VerifierService';
import { MarkAccountAsApproved } from 'Verification/IntegrationLogic/UseCase/MarkAccountAsApproved';

export class PortsProvider {
  private config: Verification.Config;

  constructor(config: Verification.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(VerifierService, [VerifierRepository, VerifierExecutor]);
    container.addSingleton(MarkAccountAsApproved, [VerifierService]);
    container.addSingleton(VerifyAccount, [RegistrationService, VerifierService]);

    // api
    container.addSingleton(AdminVerificationActions, [VerifierRepository]);
    container.addSingleton(PrincipalApprovals, [MarkAccountAsApproved]);
    container.addSingleton(UserVerificationActions, [VerifierRepository]);
    container.addSingleton(NorthCapitalVerificationEvents, [VerifierRepository]);
  }
}

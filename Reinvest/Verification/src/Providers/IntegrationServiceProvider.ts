import { ContainerInterface } from 'Container/Container';
import { VerificationAdapter } from 'Verification/Adapter/Database/Repository/VerificationAdapter';
import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';
import { Verification } from 'Verification/index';
import { VerifierExecutor } from 'Verification/IntegrationLogic/Verifier/VerifierExecutor';
import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';
import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';

export class IntegrationServiceProvider {
  private config: Verification.Config;

  constructor(config: Verification.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(VerifierExecutor, [VerificationNorthCapitalAdapter]);
    container.addSingleton(VerifierRepository, [VerificationAdapter, RegistrationService]);
  }
}

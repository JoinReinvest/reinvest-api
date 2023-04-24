import { ContainerInterface } from 'Container/Container';
import { VerificationAdapter } from 'Verification/Adapter/Database/Repository/VerificationAdapter';
import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';
import { Verification } from 'Verification/index';
import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';

export class IntegrationServiceProvider {
  private config: Verification.Config;

  constructor(config: Verification.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(VerifierRepository, [VerificationNorthCapitalAdapter, VerificationAdapter]);
  }
}

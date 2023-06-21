import { ContainerInterface } from 'Container/Container';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { VerificationAdapter } from 'Verification/Adapter/Database/Repository/VerificationAdapter';
import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';
import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';
import { Verification } from 'Verification/index';
import { VerifierExecutor } from 'Verification/IntegrationLogic/Verifier/VerifierExecutor';
import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';

export class IntegrationServiceProvider {
  private config: Verification.Config;

  constructor(config: Verification.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(VerifierExecutor, [VerificationNorthCapitalAdapter, SimpleEventBus]);
    container.addSingleton(VerifierRepository, [VerificationAdapter, RegistrationService]);
  }
}

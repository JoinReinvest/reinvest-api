import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { VerificationAdapter } from 'Verification/Adapter/Database/Repository/VerificationAdapter';
import { VerificationFeesRepository } from 'Verification/Adapter/Database/Repository/VerificationFeesRepository';
import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';
import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';
import { Verification } from 'Verification/index';
import { RegisterFee } from 'Verification/IntegrationLogic/UseCase/RegisterFee';
import { VerifierExecutor } from 'Verification/IntegrationLogic/Verifier/VerifierExecutor';
import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';

export class IntegrationServiceProvider {
  private config: Verification.Config;

  constructor(config: Verification.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(RegisterFee, [VerificationFeesRepository, IdGenerator]);
    container.addSingleton(VerifierExecutor, [VerificationNorthCapitalAdapter, SimpleEventBus, RegisterFee]);
    container.addSingleton(VerifierRepository, [VerificationAdapter, RegistrationService]);
  }
}

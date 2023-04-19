import { ContainerInterface } from 'Container/Container';
import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';
import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';
import { Verification } from 'Verification/index';
import { AccountVerifier } from 'Verification/IntegrationLogic/Verifier/AccountVerifier';
import { PartyVerifierFactory } from 'Verification/IntegrationLogic/Verifier/PartyVerifierFactory';

export class IntegrationServiceProvider {
  private config: Verification.Config;

  constructor(config: Verification.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(PartyVerifierFactory, [VerificationNorthCapitalAdapter]).addSingleton(AccountVerifier, [RegistrationService, PartyVerifierFactory]);
  }
}

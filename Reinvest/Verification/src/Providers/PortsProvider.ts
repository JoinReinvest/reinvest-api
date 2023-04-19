import { ContainerInterface } from 'Container/Container';
import { Verification } from 'Verification/index';
import { VerifyAccount } from 'Verification/IntegrationLogic/UseCase/VerifyAccount';
import { AccountVerifier } from 'Verification/IntegrationLogic/Verifier/AccountVerifier';

export class PortsProvider {
  private config: Verification.Config;

  constructor(config: Verification.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(VerifyAccount, [AccountVerifier]);
  }
}

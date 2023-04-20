import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';
import { VerifierFactory } from 'Verification/IntegrationLogic/Verifier/VerifierFactory';

export class AccountVerifier {
  static getClassName = () => 'AccountVerifier';
  private registrationService: RegistrationService;
  private verifierFactory: VerifierFactory;

  constructor(registrationService: RegistrationService, partyVerifierFactory: VerifierFactory) {
    this.registrationService = registrationService;
    this.verifierFactory = partyVerifierFactory;
  }

  async verifyAccount(profileId: string, accountId: string): Promise<boolean> {
    try {
      const accountStructure = await this.registrationService.getNorthCapitalAccountStructure(profileId, accountId);
      const verifiers = await this.verifierFactory.createVerifiersFromAccountStructure(accountStructure);

      await this.verifierFactory.storeVerifiers(verifiers);
      // create party verifiers for all parties from party factory
      // run verify method for all verifiers
      // based on decisions from verifiers create verification actions

      return true;
    } catch (error: any) {
      console.error(error);

      return false;
    }
  }
}

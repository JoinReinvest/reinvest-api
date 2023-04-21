import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';
import { VerifierFactory } from 'Verification/IntegrationLogic/Verifier/VerifierFactory';
import { Verifier } from 'Verification/Domain/ValueObject/Verifiers';

export class AccountVerifier {
  static getClassName = () => 'AccountVerifier';
  private registrationService: RegistrationService;
  private verifierFactory: VerifierFactory;

  constructor(registrationService: RegistrationService, verifierFactory: VerifierFactory) {
    this.registrationService = registrationService;
    this.verifierFactory = verifierFactory;
  }

  async verifyAccount(profileId: string, accountId: string): Promise<boolean> {
    try {
      const accountStructure = await this.registrationService.getNorthCapitalAccountStructure(profileId, accountId);
      const verifiers = await this.verifierFactory.createVerifiersFromAccountStructure(accountStructure);
      const decisions = await Promise.all(verifiers.map((verifier: Verifier) => verifier.verify()));

      await this.verifierFactory.storeVerifiers(verifiers);

      // based on decisions from verifiers create verification actions
      console.log({ decisions });

      return true;
    } catch (error: any) {
      console.error(error);

      return false;
    }
  }
}

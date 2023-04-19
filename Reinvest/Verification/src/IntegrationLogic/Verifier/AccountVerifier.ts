import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';
import { PartyVerifierFactory } from 'Verification/IntegrationLogic/Verifier/PartyVerifierFactory';

export class AccountVerifier {
  static getClassName = () => 'AccountVerifier';
  private registrationService: RegistrationService;
  private partyVerifierFactory: PartyVerifierFactory;

  constructor(registrationService: RegistrationService, partyVerifierFactory: PartyVerifierFactory) {
    this.registrationService = registrationService;
    this.partyVerifierFactory = partyVerifierFactory;
  }

  async verifyAccount(profileId: string, accountId: string): Promise<boolean> {
    // get account structure from registration module that includes all linked parties, entities and it's ids in north capital

    // create party verifiers for all parties from party factory
    // run verify method for all verifiers
    // based on decisions from verifiers create verification actions
    return true;
  }
}

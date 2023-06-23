import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';
import { AccountVerificationDecision } from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerifierService } from 'Verification/IntegrationLogic/Service/VerifierService';

export class VerifyAccount {
  private registrationService: RegistrationService;
  private verifierService: VerifierService;

  constructor(registrationService: RegistrationService, verifierService: VerifierService) {
    this.registrationService = registrationService;
    this.verifierService = verifierService;
  }

  static getClassName = () => 'VerifyAccount';

  async verify(profileId: string, accountId: string): Promise<AccountVerificationDecision> {
    try {
      console.log('verify account id ' + accountId);
      await this.registrationService.immediatelySynchronizeAllAccountStructure(profileId, accountId);
      const { accountVerifier, verifiers } = await this.verifierService.createVerifiersForAccount(profileId, accountId);

      return this.verifierService.executeVerifiersDecisions(accountVerifier, verifiers);
    } catch (error: any) {
      console.error(`[Verify Account: ${accountId}]`, error);

      return {
        canUserContinueTheInvestment: false,
        isAccountVerified: false,
        requiredActions: [],
      };
    }
  }
}

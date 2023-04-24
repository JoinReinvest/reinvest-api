import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';
import { AccountVerificationDecision } from 'Verification/Domain/ValueObject/VerificationDecision';
import { Verifier } from 'Verification/Domain/ValueObject/Verifiers';
import { AccountVerifier } from 'Verification/IntegrationLogic/Verifier/AccountVerifier';
import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';

export class VerifyAccount {
  static getClassName = () => 'VerifyAccount';
  private registrationService: RegistrationService;
  private verifierRepository: VerifierRepository;

  constructor(registrationService: RegistrationService, verifierRepository: VerifierRepository) {
    this.registrationService = registrationService;
    this.verifierRepository = verifierRepository;
  }

  async verify(profileId: string, accountId: string): Promise<AccountVerificationDecision> {
    try {
      console.log('verify account id ' + accountId);
      const accountStructure = await this.registrationService.getNorthCapitalAccountStructure(profileId, accountId);
      const verifiers = await this.verifierRepository.createVerifiersFromAccountStructure(accountStructure);
      const accountVerifier = new AccountVerifier(profileId, accountId);

      const decisions = await Promise.all(verifiers.map((verifier: Verifier) => verifier.verify()));
      await this.verifierRepository.storeVerifiers(verifiers);

      return accountVerifier.makeAccountVerificationDecision(decisions);
    } catch (error: any) {
      console.error(error);

      return {
        canUserContinueTheInvestment: false,
        isAccountVerified: false,
        requiredActions: [],
      };
    }
  }
}

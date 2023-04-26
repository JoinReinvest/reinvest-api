import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';
import { AccountVerificationDecision } from 'Verification/Domain/ValueObject/VerificationDecision';
import { Verifier } from 'Verification/Domain/ValueObject/Verifiers';
import { AccountVerifier } from 'Verification/IntegrationLogic/Verifier/AccountVerifier';
import { VerifierExecutor } from 'Verification/IntegrationLogic/Verifier/VerifierExecutor';
import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';

export class VerifyAccount {
  static getClassName = () => 'VerifyAccount';
  private registrationService: RegistrationService;
  private verifierRepository: VerifierRepository;
  private verifierExecutor: VerifierExecutor;

  constructor(registrationService: RegistrationService, verifierRepository: VerifierRepository, verifierExecutor: VerifierExecutor) {
    this.registrationService = registrationService;
    this.verifierRepository = verifierRepository;
    this.verifierExecutor = verifierExecutor;
  }

  async verify(profileId: string, accountId: string): Promise<AccountVerificationDecision> {
    try {
      console.log('verify account id ' + accountId);
      const accountStructure = await this.registrationService.getNorthCapitalAccountStructure(profileId, accountId);
      const verifiers = await this.verifierRepository.createVerifiersFromAccountStructure(accountStructure);
      const accountVerifier = new AccountVerifier(profileId, accountId);
      const verifierExecutor = this.verifierExecutor;

      const decisions = await Promise.all(verifiers.map((verifier: Verifier) => verifierExecutor.executeDecision(verifier)));
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

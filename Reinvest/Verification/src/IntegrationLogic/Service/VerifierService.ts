import { AccountVerificationDecision } from 'Verification/Domain/ValueObject/VerificationDecision';
import { Verifier } from 'Verification/Domain/ValueObject/Verifiers';
import { AccountVerifier } from 'Verification/IntegrationLogic/Verifier/AccountVerifier';
import { VerifierExecutor } from 'Verification/IntegrationLogic/Verifier/VerifierExecutor';
import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';

export class VerifierService {
  private verifierRepository: VerifierRepository;
  private verifierExecutor: VerifierExecutor;

  constructor(verifierRepository: VerifierRepository, verifierExecutor: VerifierExecutor) {
    this.verifierRepository = verifierRepository;
    this.verifierExecutor = verifierExecutor;
  }

  static getClassName = () => 'VerifierService';

  async createVerifiersForAccount(
    profileId: string,
    accountId: string,
  ): Promise<{
    accountVerifier: AccountVerifier;
    verifiers: Verifier[];
  }> {
    return this.verifierRepository.getVerifiersByAccountId(profileId, accountId);
  }

  async executeVerifiersDecisions(accountVerifier: AccountVerifier, verifiers: Verifier[]): Promise<AccountVerificationDecision> {
    try {
      const verifierExecutor = this.verifierExecutor;

      const decisions = await Promise.all(verifiers.map(async (verifier: Verifier) => await verifierExecutor.executeDecision(verifier)));
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

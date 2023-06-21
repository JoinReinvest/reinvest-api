import { PrincipalVerificationEvent, VerificationEvents } from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerifierService } from 'Verification/IntegrationLogic/Service/VerifierService';

export class MarkAccountAsApproved {
  private verifierService: VerifierService;

  constructor(verifierService: VerifierService) {
    this.verifierService = verifierService;
  }

  static getClassName = () => 'MarkAccountAsApproved';

  async execute(profileId: string, accountId: string): Promise<void> {
    try {
      const { accountVerifier, verifiers } = await this.verifierService.createVerifiersForAccount(profileId, accountId);
      const principalApproved = (partyId: string) =>
        <PrincipalVerificationEvent>{
          date: new Date(),
          kind: VerificationEvents.PRINCIPAL_APPROVED,
          ncId: partyId,
        };

      verifiers.forEach(verifier => verifier.handleVerificationEvent([principalApproved(verifier.getPartyId())]));

      await this.verifierService.executeVerifiersDecisions(accountVerifier, verifiers);
    } catch (error: any) {
      console.error(error);
    }
  }
}

import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { PrincipalVerificationEvent, VerificationEvents } from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerifierService } from 'Verification/IntegrationLogic/Service/VerifierService';

export class MarkAccountAsApproved {
  private verifierService: VerifierService;
  private eventBus: EventBus;

  constructor(verifierService: VerifierService, eventBus: EventBus) {
    this.verifierService = verifierService;
    this.eventBus = eventBus;
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
      // await this.eventBus.publish(<DomainEvent>{
      //   kind: 'PrincipalVerificationMadeDecision',
      //   data: {
      //     accountId,
      //     profileId,
      //   },
      //   id: accountId,
      // });
    } catch (error: any) {
      console.error(error);
    }
  }
}

import { DateTime } from 'Money/DateTime';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { PrincipalVerificationEvent, VerificationEvents } from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerifierType } from 'Verification/Domain/ValueObject/Verifiers';
import { VerifierService } from 'Verification/IntegrationLogic/Service/VerifierService';

export class MarkAccountAsDisapproved {
  private verifierService: VerifierService;
  private eventBus: EventBus;

  constructor(verifierService: VerifierService, eventBus: EventBus) {
    this.verifierService = verifierService;
    this.eventBus = eventBus;
  }

  static getClassName = () => 'MarkAccountAsDisapproved';

  async execute(profileId: string, accountId: string, objectIds: string[]): Promise<void> {
    try {
      const { accountVerifier, verifiers } = await this.verifierService.createVerifiersForAccount(profileId, accountId);
      const principalDisapproved = (partyId: string) =>
        <PrincipalVerificationEvent>{
          date: DateTime.now().toDate(),
          kind: VerificationEvents.PRINCIPAL_DISAPPROVED,
          ncId: partyId,
        };

      let filteredVerifiers = verifiers.filter(verifier => objectIds.includes(verifier.getPartyId()));

      if (filteredVerifiers.length === 0) {
        filteredVerifiers = accountVerifier.isIndividual() ? verifiers : verifiers.filter(verifier => verifier.isType(VerifierType.COMPANY));
      }

      filteredVerifiers.forEach(verifier => verifier.handleVerificationEvent([principalDisapproved(verifier.getPartyId())]));

      await this.verifierService.executeVerifiersDecisions(accountVerifier, verifiers);
    } catch (error: any) {
      console.error(error);
    }
  }
}

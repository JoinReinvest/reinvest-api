import { DateTime } from 'Money/DateTime';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { PrincipalVerificationEvent, VerificationEvents } from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerifierType } from 'Verification/Domain/ValueObject/Verifiers';
import { VerifierService } from 'Verification/IntegrationLogic/Service/VerifierService';

export class MarkAccountAsNeedMoreInfo {
  private verifierService: VerifierService;
  private eventBus: EventBus;

  constructor(verifierService: VerifierService, eventBus: EventBus) {
    this.verifierService = verifierService;
    this.eventBus = eventBus;
  }

  static getClassName = () => 'MarkAccountAsNeedMoreInfo';

  async execute(profileId: string, accountId: string, objectIds: string[]): Promise<void> {
    try {
      const { accountVerifier, verifiers } = await this.verifierService.createVerifiersForAccount(profileId, accountId);
      const principalNeedsMoreInfo = (partyId: string) =>
        <PrincipalVerificationEvent>{
          date: DateTime.now().toDate(),
          kind: VerificationEvents.PRINCIPAL_NEED_MORE_INFO,
          ncId: partyId,
        };

      let filteredVerifiers = verifiers.filter(verifier => objectIds.includes(verifier.getPartyId()));

      if (filteredVerifiers.length === 0) {
        filteredVerifiers = accountVerifier.isIndividual() ? verifiers : verifiers.filter(verifier => verifier.isType(VerifierType.COMPANY));
      }

      filteredVerifiers.forEach(verifier => verifier.handleVerificationEvent([principalNeedsMoreInfo(verifier.getPartyId())]));

      const accountDecision = await this.verifierService.executeVerifiersDecisions(accountVerifier, verifiers);

      if (!accountDecision.canUserContinueTheInvestment) {
        await this.eventBus.publish(<DomainEvent>{
          kind: 'PrincipalVerificationNeedsMoreInfo',
          data: {
            accountId,
            profileId,
          },
          id: accountId,
        });
      }
    } catch (error: any) {
      console.error(error);
    }
  }
}

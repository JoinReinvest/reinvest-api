import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';
import { VerificationDecision, VerificationDecisionType } from 'Verification/Domain/ValueObject/VerificationDecision';
import { Verifier } from 'Verification/Domain/ValueObject/Verifiers';

export class VerifierExecutor {
  private northCapitalAdapter: VerificationNorthCapitalAdapter;
  private eventBus: EventBus;

  constructor(northCapitalAdapter: VerificationNorthCapitalAdapter, eventBus: EventBus) {
    this.northCapitalAdapter = northCapitalAdapter;
    this.eventBus = eventBus;
  }

  static getClassName = () => 'VerifierExecutor';

  async executeDecision(verifier: Verifier): Promise<VerificationDecision> {
    let decision = verifier.makeDecision();

    // parties aml + kyc
    if ([VerificationDecisionType.REQUEST_VERIFICATION].includes(decision.decision)) {
      const verificationResult = await this.northCapitalAdapter.verifyParty(verifier.getPartyId());
      verifier.handleVerificationEvent(verificationResult);

      decision = verifier.makeDecision();
    }

    if ([VerificationDecisionType.SET_KYC_STATUS_TO_PENDING].includes(decision.decision)) {
      const event = await this.northCapitalAdapter.setPartyKycStatusToPending(verifier.getPartyId());
      verifier.handleVerificationEvent(event);

      decision = verifier.makeDecision();
    }

    if ([VerificationDecisionType.PAID_MANUAL_KYC_REVIEW_REQUIRED].includes(decision.decision)) {
      const verificationResult = await this.northCapitalAdapter.getPartyKycAmlStatus(verifier.getPartyId());
      verifier.handleVerificationEvent(verificationResult);

      decision = verifier.makeDecision();
    }

    // company aml + kyb
    if ([VerificationDecisionType.REQUEST_AML_VERIFICATION].includes(decision.decision)) {
      const verificationResult = await this.northCapitalAdapter.verifyAmlOnly(verifier.getPartyId());
      verifier.handleVerificationEvent(verificationResult);

      decision = verifier.makeDecision();
    }

    if ([VerificationDecisionType.SET_KYB_STATUS_TO_PENDING].includes(decision.decision)) {
      const event = await this.northCapitalAdapter.setEntityKycStatusToPending(verifier.getPartyId());
      verifier.handleVerificationEvent(event);

      decision = verifier.makeDecision();
    }

    if ([VerificationDecisionType.MANUAL_KYB_REVIEW_REQUIRED, VerificationDecisionType.PAID_MANUAL_KYB_REVIEW_REQUIRED].includes(decision.decision)) {
      const verificationResult = await this.northCapitalAdapter.getEntityKycAmlStatus(verifier.getPartyId());

      verifier.handleVerificationEvent(verificationResult);

      decision = verifier.makeDecision();
    }

    if ([VerificationDecisionType.ACCOUNT_BANNED, VerificationDecisionType.PROFILE_BANNED].includes(decision.decision)) {
      await this.eventBus.publish(<DomainEvent>{
        id: '',
        kind: VerificationDecisionType.ACCOUNT_BANNED ? 'AccountBanned' : 'ProfileBanned',
        data: {
          profileId: decision.onObject?.profileId ?? null,
          accountId: decision.onObject?.accountId ?? null,
          stakeholderId: decision.onObject?.stakeholderId ?? null,
          type: decision.onObject.type,
          reasons: decision.reasons,
        },
      });
    }

    return decision;
  }
}

import { AvailableEventsForDecision, VerificationDecision, VerificationDecisionType } from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerificationEvent, VerificationEvents, VerificationStatus } from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerificationState, Verifier } from 'Verification/Domain/ValueObject/Verifiers';
import { AbstractVerifier } from 'Verification/IntegrationLogic/Verifier/AbstractVerifier';

export class CompanyVerifier extends AbstractVerifier implements Verifier {
  protected availableEventsForDecision: AvailableEventsForDecision = {
    ANY_TIME: [VerificationEvents.VERIFICATION_USER_OBJECT_UPDATED, VerificationEvents.VERIFICATION_CLEANED_ADMINISTRATIVE],
    [VerificationDecisionType.REQUEST_AML_VERIFICATION]: [
      VerificationEvents.VERIFICATION_AML_RESULT,
      VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
    ],
    [VerificationDecisionType.WAIT_FOR_SUPPORT]: [
      VerificationEvents.VERIFICATION_RECOVERED_ADMINISTRATIVE,
      VerificationEvents.VERIFICATION_KYC_RESULT,
      VerificationEvents.VERIFICATION_AML_RESULT,
    ],
    [VerificationDecisionType.ENTITY_UPDATE_REQUIRED]: [VerificationEvents.VERIFICATION_REQUESTED_OBJECT_UPDATED],
    [VerificationDecisionType.ACCOUNT_BANNED]: [VerificationEvents.VERIFICATION_ACCOUNT_UNBANNED_ADMINISTRATIVE],
    [VerificationDecisionType.MANUAL_KYB_REVIEW_REQUIRED]: [
      VerificationEvents.VERIFICATION_KYC_RESULT,
      VerificationEvents.VERIFICATION_AML_RESULT,
      VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
    ],
    [VerificationDecisionType.PAID_MANUAL_KYB_REVIEW_REQUIRED]: [
      VerificationEvents.VERIFICATION_KYC_RESULT,
      VerificationEvents.VERIFICATION_AML_RESULT,
      VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
    ],
  };

  constructor(state: VerificationState) {
    super(state);
    this.makeDecision();
  }

  handleVerificationEvent(events: VerificationEvent | VerificationEvent[]) {
    const eventsToHandle = !Array.isArray(events) ? [events] : events;
    eventsToHandle.forEach(event => {
      super.handleEvent(event, this.availableEventsForDecision);
    });

    this.makeDecision();
  }

  makeDecision(): VerificationDecision {
    this.decision = this.makeDecisionForCompany();

    return this.decision;
  }

  private makeDecisionForCompany(): VerificationDecision {
    const onObject = {
      type: this.type,
      accountId: this.id,
    };

    let decision: VerificationDecisionType = VerificationDecisionType.UNKNOWN;
    const { amlStatus, kycCounter, kycStatus, reasons, wasFailedRequest, objectUpdatesCounter } = this.analyzeEvents();
    let someReasons = reasons;

    if (wasFailedRequest) {
      decision = VerificationDecisionType.WAIT_FOR_SUPPORT;

      return {
        decision,
        reasons: someReasons,
        onObject,
      };
    }

    if (amlStatus === VerificationStatus.PENDING) {
      return {
        decision: VerificationDecisionType.REQUEST_AML_VERIFICATION,
        onObject,
      };
    }

    if (amlStatus === VerificationStatus.DISAPPROVED) {
      decision = VerificationDecisionType.ACCOUNT_BANNED;

      return {
        decision,
        onObject,
        reasons: ['AML verification failed'],
      };
    }

    if (kycStatus === VerificationStatus.PENDING) {
      return {
        decision: VerificationDecisionType.MANUAL_KYB_REVIEW_REQUIRED,
        onObject,
      };
    }

    if (kycStatus === VerificationStatus.DISAPPROVED) {
      // failed once, ask for update
      if (kycCounter === 1 && objectUpdatesCounter === 0) {
        decision = VerificationDecisionType.ENTITY_UPDATE_REQUIRED;
        someReasons = reasons;
      }

      // failed once, object updated, request for another verification
      if (kycCounter === 1 && objectUpdatesCounter === 1) {
        decision = VerificationDecisionType.PAID_MANUAL_KYB_REVIEW_REQUIRED;
        someReasons = reasons;
      }

      // failed again, ban account
      if (kycCounter > 1) {
        decision = VerificationDecisionType.ACCOUNT_BANNED;
        someReasons = ['Manual KYB verification failed'];
      }

      return {
        decision,
        reasons: someReasons,
        onObject,
      };
    }

    if (kycStatus === VerificationStatus.APPROVED && amlStatus === VerificationStatus.APPROVED) {
      decision = VerificationDecisionType.APPROVED;

      return {
        decision,
        onObject,
      };
    }

    console.error('Decision for entity is unknown', {
      onObject,
      amlStatus,
      kycStatus,
      kycCounter,
      reasons,
      wasFailedRequest,
      objectUpdatesCounter,
    });

    throw new Error('Unknown decision for entity verification');
  }
}

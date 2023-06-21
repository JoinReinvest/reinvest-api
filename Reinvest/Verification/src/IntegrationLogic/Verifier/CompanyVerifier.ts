import { AvailableEventsForDecision, VerificationDecision, VerificationDecisionType } from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerificationEvent, VerificationEvents, VerificationStatus } from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerificationState, Verifier } from 'Verification/Domain/ValueObject/Verifiers';
import { AbstractVerifier } from 'Verification/IntegrationLogic/Verifier/AbstractVerifier';

export class CompanyVerifier extends AbstractVerifier implements Verifier {
  protected availableEventsForDecision: AvailableEventsForDecision = {
    ANY_TIME: [
      VerificationEvents.VERIFICATION_USER_OBJECT_UPDATED,
      VerificationEvents.VERIFICATION_CLEANED_ADMINISTRATIVE,
      VerificationEvents.PRINCIPAL_APPROVED,
      VerificationEvents.PRINCIPAL_DISAPPROVED,
      VerificationEvents.PRINCIPAL_NEED_MORE_INFO,
    ],
    [VerificationDecisionType.REQUEST_AML_VERIFICATION]: [
      VerificationEvents.VERIFICATION_AML_RESULT,
      VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
    ],
    [VerificationDecisionType.WAIT_FOR_SUPPORT]: [VerificationEvents.VERIFICATION_RECOVERED_ADMINISTRATIVE],
    [VerificationDecisionType.ENTITY_UPDATE_REQUIRED]: [VerificationEvents.VERIFICATION_REQUESTED_OBJECT_UPDATED],
    [VerificationDecisionType.ACCOUNT_BANNED]: [VerificationEvents.VERIFICATION_ACCOUNT_UNBANNED_ADMINISTRATIVE],
    [VerificationDecisionType.MANUAL_KYB_REVIEW_REQUIRED]: [
      VerificationEvents.MANUAL_VERIFICATION_KYC_RESULT,
      VerificationEvents.MANUAL_VERIFICATION_AML_RESULT,
      VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
    ],
    [VerificationDecisionType.PAID_MANUAL_KYB_REVIEW_REQUIRED]: [
      VerificationEvents.MANUAL_VERIFICATION_KYC_RESULT,
      VerificationEvents.MANUAL_VERIFICATION_AML_RESULT,
      VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
    ],
    [VerificationDecisionType.SET_KYB_STATUS_TO_PENDING]: [
      VerificationEvents.VERIFICATION_KYC_SET_TO_PENDING,
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
    const { amlStatus, failedKycCounter, kycStatus, reasons, needMoreInfo, wasFailedRequest, objectUpdatesCounter, isKycInPendingState } = this.analyzeEvents();
    let someReasons = reasons;

    if (wasFailedRequest) {
      decision = VerificationDecisionType.WAIT_FOR_SUPPORT;

      return {
        decision,
        reasons: someReasons,
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

    if (needMoreInfo) {
      return {
        decision: VerificationDecisionType.ENTITY_UPDATE_REQUIRED,
        onObject,
        reasons: someReasons,
      };
    }

    if (kycStatus === VerificationStatus.DISAPPROVED) {
      // failed once, ask for update
      if (failedKycCounter === 1 && objectUpdatesCounter === 0) {
        decision = VerificationDecisionType.ENTITY_UPDATE_REQUIRED;
        someReasons = reasons;
      }

      // failed once, object updated, request for another verification
      if (failedKycCounter === 1 && objectUpdatesCounter === 1) {
        if (isKycInPendingState) {
          // object is prepared for manual verification
          decision = VerificationDecisionType.PAID_MANUAL_KYB_REVIEW_REQUIRED;
        } else {
          // we need to prepare object for manual verification
          decision = VerificationDecisionType.SET_KYB_STATUS_TO_PENDING;
        }

        someReasons = reasons;
      }

      // failed again, ban account
      if (failedKycCounter > 1) {
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

    if (amlStatus === VerificationStatus.PENDING) {
      return {
        decision: VerificationDecisionType.REQUEST_AML_VERIFICATION,
        onObject,
      };
    }

    if (kycStatus === VerificationStatus.PENDING) {
      if (isKycInPendingState) {
        // object is prepared for manual verification
        decision = VerificationDecisionType.MANUAL_KYB_REVIEW_REQUIRED;
      } else {
        // we need to prepare object for manual verification
        decision = VerificationDecisionType.SET_KYB_STATUS_TO_PENDING;
      }

      return {
        decision,
        onObject,
      };
    }

    console.error('Decision for entity is unknown', {
      onObject,
      amlStatus,
      kycStatus,
      failedKycCounter: failedKycCounter,
      reasons,
      wasFailedRequest,
      objectUpdatesCounter,
    });

    throw new Error('Unknown decision for entity verification');
  }
}

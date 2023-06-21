import {
  AvailableEventsForDecision,
  VerificationDecision,
  VerificationDecisionType,
  VerificationObject,
} from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerificationEvents, VerificationStatus } from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerifierType } from 'Verification/Domain/ValueObject/Verifiers';
import { AbstractVerifier } from 'Verification/IntegrationLogic/Verifier/AbstractVerifier';

export class PartyVerifier extends AbstractVerifier {
  protected availableEventsForDecision: AvailableEventsForDecision = {
    ANY_TIME: [
      VerificationEvents.VERIFICATION_USER_OBJECT_UPDATED,
      VerificationEvents.VERIFICATION_CLEANED_ADMINISTRATIVE,
      VerificationEvents.PRINCIPAL_APPROVED,
      VerificationEvents.PRINCIPAL_DISAPPROVED,
      VerificationEvents.PRINCIPAL_NEED_MORE_INFO,
    ],
    [VerificationDecisionType.REQUEST_VERIFICATION]: [
      VerificationEvents.VERIFICATION_KYC_RESULT,
      VerificationEvents.VERIFICATION_AML_RESULT,
      VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
    ],
    [VerificationDecisionType.REQUEST_AML_VERIFICATION]: [
      VerificationEvents.VERIFICATION_AML_RESULT,
      VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
    ],
    [VerificationDecisionType.WAIT_FOR_SUPPORT]: [VerificationEvents.VERIFICATION_RECOVERED_ADMINISTRATIVE],
    [VerificationDecisionType.UPDATE_REQUIRED]: [VerificationEvents.VERIFICATION_REQUESTED_OBJECT_UPDATED],
    [VerificationDecisionType.SECOND_UPDATE_REQUIRED]: [VerificationEvents.VERIFICATION_REQUESTED_OBJECT_UPDATED],
    [VerificationDecisionType.PROFILE_BANNED]: [VerificationEvents.VERIFICATION_PROFILE_UNBANNED_ADMINISTRATIVE],
    [VerificationDecisionType.ACCOUNT_BANNED]: [VerificationEvents.VERIFICATION_ACCOUNT_UNBANNED_ADMINISTRATIVE],
    [VerificationDecisionType.PAID_MANUAL_KYC_REVIEW_REQUIRED]: [
      VerificationEvents.MANUAL_VERIFICATION_KYC_RESULT,
      VerificationEvents.MANUAL_VERIFICATION_AML_RESULT,
      VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
    ],
    [VerificationDecisionType.SET_KYC_STATUS_TO_PENDING]: [
      VerificationEvents.VERIFICATION_KYC_SET_TO_PENDING,
      VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
    ],
  };

  protected makeDecisionForParty(onObject: VerificationObject): VerificationDecision {
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
      decision = this.isProfile() ? VerificationDecisionType.PROFILE_BANNED : VerificationDecisionType.ACCOUNT_BANNED;

      return {
        decision,
        onObject,
        reasons: ['AML verification failed'],
      };
    }

    if (needMoreInfo) {
      return {
        decision: VerificationDecisionType.UPDATE_REQUIRED,
        onObject,
        reasons: someReasons,
      };
    }

    if (kycStatus === VerificationStatus.DISAPPROVED) {
      // must await for update
      if (failedKycCounter === 1 && objectUpdatesCounter === 0) {
        decision = VerificationDecisionType.UPDATE_REQUIRED;
      }

      // user updated object, so we can check it again
      if (failedKycCounter === 1 && objectUpdatesCounter === 1) {
        decision = VerificationDecisionType.REQUEST_VERIFICATION;
      }

      // user updated object, but it failed again - request another update
      if (failedKycCounter === 2 && objectUpdatesCounter === 1) {
        decision = VerificationDecisionType.SECOND_UPDATE_REQUIRED;
      }

      // user updated object, so now we must wait for manual kyc review
      if (failedKycCounter === 2 && objectUpdatesCounter === 2) {
        if (isKycInPendingState) {
          // object is prepared for manual verification
          decision = VerificationDecisionType.PAID_MANUAL_KYC_REVIEW_REQUIRED;
        } else {
          // we need to prepare object for manual verification
          decision = VerificationDecisionType.SET_KYC_STATUS_TO_PENDING;
        }
      }

      if (failedKycCounter >= 3) {
        decision = this.isProfile() ? VerificationDecisionType.PROFILE_BANNED : VerificationDecisionType.ACCOUNT_BANNED;
        someReasons = ['Manual KYC verification failed'];
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

    if (kycStatus === VerificationStatus.PENDING) {
      decision = VerificationDecisionType.REQUEST_VERIFICATION;

      return {
        decision,
        onObject,
      };
    }

    if (amlStatus === VerificationStatus.PENDING) {
      decision = VerificationDecisionType.REQUEST_AML_VERIFICATION;

      return {
        decision,
        onObject,
      };
    }

    console.error('Decision for party verification is unknown', {
      onObject,
      amlStatus,
      kycStatus,
      failedKycCounter: failedKycCounter,
      reasons,
      wasFailedRequest,
      objectUpdatesCounter,
    });

    throw new Error('Unknown decision for party verification');
  }

  private isProfile(): boolean {
    return this.type === VerifierType.PROFILE;
  }
}

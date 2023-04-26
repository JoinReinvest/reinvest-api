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
    ANY_TIME: [VerificationEvents.VERIFICATION_USER_OBJECT_UPDATED, VerificationEvents.VERIFICATION_CLEANED_ADMINISTRATIVE],
    [VerificationDecisionType.REQUEST_VERIFICATION]: [
      VerificationEvents.VERIFICATION_KYC_RESULT,
      VerificationEvents.VERIFICATION_AML_RESULT,
      VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
    ],
    [VerificationDecisionType.WAIT_FOR_SUPPORT]: [
      VerificationEvents.VERIFICATION_RECOVERED_ADMINISTRATIVE,
      VerificationEvents.VERIFICATION_KYC_RESULT,
      VerificationEvents.VERIFICATION_AML_RESULT,
    ],
    [VerificationDecisionType.UPDATE_REQUIRED]: [VerificationEvents.VERIFICATION_REQUESTED_OBJECT_UPDATED],
    [VerificationDecisionType.SECOND_UPDATE_REQUIRED]: [VerificationEvents.VERIFICATION_REQUESTED_OBJECT_UPDATED],
    [VerificationDecisionType.PROFILE_BANNED]: [VerificationEvents.VERIFICATION_PROFILE_UNBANNED_ADMINISTRATIVE],
    [VerificationDecisionType.ACCOUNT_BANNED]: [VerificationEvents.VERIFICATION_ACCOUNT_UNBANNED_ADMINISTRATIVE],
    [VerificationDecisionType.PAID_MANUAL_KYC_REVIEW_REQUIRED]: [
      VerificationEvents.VERIFICATION_KYC_RESULT,
      VerificationEvents.VERIFICATION_AML_RESULT,
      VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
    ],
  };

  protected makeDecisionForParty(onObject: VerificationObject): VerificationDecision {
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

    if (amlStatus === VerificationStatus.DISAPPROVED) {
      decision = this.isProfile() ? VerificationDecisionType.PROFILE_BANNED : VerificationDecisionType.ACCOUNT_BANNED;

      return {
        decision,
        onObject,
        reasons: ['AML verification failed'],
      };
    }

    if (kycStatus === VerificationStatus.DISAPPROVED) {
      // must await for update
      if (kycCounter === 1 && objectUpdatesCounter === 0) {
        decision = VerificationDecisionType.UPDATE_REQUIRED;
      }

      // user updated object, so we can check it again
      if (kycCounter === 1 && objectUpdatesCounter === 1) {
        decision = VerificationDecisionType.REQUEST_VERIFICATION;
      }

      // user updated object, but it failed again - request another update
      if (kycCounter === 2 && objectUpdatesCounter === 1) {
        decision = VerificationDecisionType.SECOND_UPDATE_REQUIRED;
      }

      // user updated object, so now we must wait for manual kyc review
      if (kycCounter === 2 && objectUpdatesCounter === 2) {
        decision = VerificationDecisionType.PAID_MANUAL_KYC_REVIEW_REQUIRED;
      }

      if (kycCounter >= 3) {
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

    if (kycStatus === VerificationStatus.PENDING || amlStatus === VerificationStatus.PENDING) {
      decision = VerificationDecisionType.REQUEST_VERIFICATION;

      return {
        decision,
        onObject,
      };
    }

    console.error('Decision for party verification is unknown', {
      onObject,
      amlStatus,
      kycStatus,
      kycCounter,
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

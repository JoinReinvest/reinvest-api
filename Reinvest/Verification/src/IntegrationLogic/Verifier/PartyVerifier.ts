import { VerificationDecision, VerificationDecisionType, VerificationObject } from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerificationStatus } from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerifierType } from 'Verification/Domain/ValueObject/Verifiers';
import { AbstractVerifier } from 'Verification/IntegrationLogic/Verifier/AbstractVerifier';

export class PartyVerifier extends AbstractVerifier {
  protected makeDecisionForParty(onObject: VerificationObject): VerificationDecision {
    let decision: VerificationDecisionType = VerificationDecisionType.REQUEST_VERIFICATION;
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
      if (kycCounter <= 1) {
        // if (objectUpdatesCounter === kycCounter) { // todo infinite loop - fix it
        //   decision = VerificationDecisionType.REQUEST_VERIFICATION;
        // } else {
        decision = VerificationDecisionType.UPDATE_REQUIRED;
        // }
      }

      // if (kycCounter === 2) {
      //   decision = VerificationDecisionType.PAID_MANUAL_KYC_REVIEW_REQUIRED;
      // }

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

    return {
      decision,
      onObject,
    };
  }

  private isProfile(): boolean {
    return this.type === VerifierType.PROFILE;
  }
}

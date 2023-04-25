import { VerificationDecision, VerificationDecisionType } from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerificationStatus } from 'Verification/Domain/ValueObject/VerificationEvents';
import { Verifier } from 'Verification/Domain/ValueObject/Verifiers';
import { AbstractVerifier } from 'Verification/IntegrationLogic/Verifier/AbstractVerifier';

export class CompanyVerifier extends AbstractVerifier implements Verifier {
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
    const { amlStatus, kycCounter, kycStatus, reasons, wasFailedRequest } = this.analyzeEvents();
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

    if (kycStatus === VerificationStatus.PENDING && kycCounter === 0) {
      return {
        decision: VerificationDecisionType.MANUAL_KYB_REVIEW_REQUIRED,
        onObject,
      };
    }

    if (kycStatus === VerificationStatus.DISAPPROVED) {
      if (kycCounter === 1) {
        decision = VerificationDecisionType.ENTITY_UPDATE_REQUIRED;
        someReasons = reasons;
      }

      // if (kycCounter === 1) {
      //   decision = VerificationDecisionType.PAID_MANUAL_KYB_REVIEW_REQUIRED;
      //   someReasons = reasons;
      // }

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

    return {
      decision,
      onObject,
    };
  }
}

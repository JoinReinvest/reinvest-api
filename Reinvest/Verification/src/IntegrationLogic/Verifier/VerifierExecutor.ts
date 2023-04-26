import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';
import { VerificationDecision, VerificationDecisionType } from 'Verification/Domain/ValueObject/VerificationDecision';
import { Verifier } from 'Verification/Domain/ValueObject/Verifiers';

export class VerifierExecutor {
  static getClassName = () => 'VerifierExecutor';
  private northCapitalAdapter: VerificationNorthCapitalAdapter;

  constructor(northCapitalAdapter: VerificationNorthCapitalAdapter) {
    this.northCapitalAdapter = northCapitalAdapter;
  }

  async executeDecision(verifier: Verifier): Promise<VerificationDecision> {
    const decision = verifier.makeDecision();

    if ([VerificationDecisionType.REQUEST_VERIFICATION].includes(decision.decision)) {
      const verificationResult = await this.northCapitalAdapter.verifyParty(verifier.getPartyId());
      verifier.handleVerificationEvent(verificationResult);

      return verifier.makeDecision();
    }

    if ([VerificationDecisionType.SET_KYC_STATUS_TO_PENDING].includes(decision.decision)) {
      const event = await this.northCapitalAdapter.setPartyKycStatusToPending(verifier.getPartyId());
      verifier.handleVerificationEvent(event);

      return verifier.makeDecision();
    }

    if ([VerificationDecisionType.PAID_MANUAL_KYC_REVIEW_REQUIRED].includes(decision.decision)) {
      const verificationResult = await this.northCapitalAdapter.getPartyKycAmlStatus(verifier.getPartyId());
      verifier.handleVerificationEvent(verificationResult);

      return verifier.makeDecision();
    }

    if ([VerificationDecisionType.REQUEST_AML_VERIFICATION].includes(decision.decision)) {
      const verificationResult = await this.northCapitalAdapter.verifyAmlOnly(verifier.getPartyId());
      verifier.handleVerificationEvent(verificationResult);

      return verifier.makeDecision();
    }

    // todo revisit manual kyb decisions
    // if ([VerificationDecisionType.MANUAL_KYB_REVIEW_REQUIRED, VerificationDecisionType.ENTITY_UPDATE_REQUIRED].includes(decision.decision)) {
    //   const verificationResult = await this.northCapitalAdapter.getEntityVerificationStatus(verifier.getPartyId());
    //
    //   verificationResult?.forEach(event => {
    //     verifier.handleVerificationEvent(event);
    //   });
    //
    //   return verifier.makeDecision();
    // }

    return decision;
  }
}

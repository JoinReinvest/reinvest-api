import { VerificationDecision } from 'Verification/Domain/ValueObject/VerificationDecision';
import { Verifier } from 'Verification/Domain/ValueObject/Verifiers';
import { PartyVerifier } from 'Verification/IntegrationLogic/Verifier/PartyVerifier';

export class ProfileVerifier extends PartyVerifier implements Verifier {
  makeDecision(): VerificationDecision {
    this.decision = this.makeDecisionForParty({
      type: this.type,
      profileId: this.id,
    });

    return this.decision;
  }
}

import { VerificationDecision } from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerificationState, Verifier } from 'Verification/Domain/ValueObject/Verifiers';
import { PartyVerifier } from 'Verification/IntegrationLogic/Verifier/PartyVerifier';

export class StakeholderVerifier extends PartyVerifier implements Verifier {
  private readonly accountId: string;

  constructor(state: VerificationState, accountId: string) {
    super(state);
    this.accountId = accountId;
  }

  makeDecision(): VerificationDecision {
    return this.makeDecisionForParty({
      type: this.type,
      stakeholderId: this.id,
      accountId: this.accountId,
    });
  }
}

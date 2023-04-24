import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';
import { VerificationDecision } from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerificationState, Verifier } from 'Verification/Domain/ValueObject/Verifiers';
import { PartyVerifier } from 'Verification/IntegrationLogic/Verifier/PartyVerifier';

export class StakeholderVerifier extends PartyVerifier implements Verifier {
  private readonly accountId: string;

  constructor(northCapitalAdapter: VerificationNorthCapitalAdapter, state: VerificationState, accountId: string) {
    super(northCapitalAdapter, state);
    this.accountId = accountId;
  }

  async verify(): Promise<VerificationDecision> {
    let decision = this.makeDecision();
    const wasPartyVerified = await this.verifyParty(decision);

    if (wasPartyVerified) {
      decision = this.makeDecision();
    }

    this.decision = decision;

    return decision;
  }

  private makeDecision(): VerificationDecision {
    return this.makeDecisionForParty({
      type: this.type,
      stakeholderId: this.id,
      accountId: this.accountId,
    });
  }
}

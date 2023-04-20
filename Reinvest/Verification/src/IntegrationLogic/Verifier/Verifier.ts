import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';
import { VerificationDecision } from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerificationEvent, VerificationState, Verifier } from 'Verification/Domain/ValueObject/Verifiers';

export class ProfileVerifier implements Verifier {
  private northCapitalAdapter: VerificationNorthCapitalAdapter;
  private verificationState: VerificationState;

  constructor(northCapitalAdapter: VerificationNorthCapitalAdapter, verificationState: VerificationState) {
    this.northCapitalAdapter = northCapitalAdapter;
    this.verificationState = verificationState;
  }

  handleVerificationEvent(event: VerificationEvent): Promise<void> {
    return Promise.resolve(undefined);
  }

  async verify(): Promise<VerificationDecision> {
    return {
      isVerified: true,
      requiredActions: [],
    };
  }

  getVerificationState(): VerificationState {
    this.verificationState.aml.push({ aml: 'Approved' }); // wip

    return this.verificationState;
  }
}

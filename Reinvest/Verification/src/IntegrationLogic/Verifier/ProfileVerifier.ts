import { VerificationDecision } from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerificationEvent } from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerificationState, Verifier } from 'Verification/Domain/ValueObject/Verifiers';
import { PartyVerifier } from 'Verification/IntegrationLogic/Verifier/PartyVerifier';

export class ProfileVerifier extends PartyVerifier implements Verifier {
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
    this.decision = this.makeDecisionForParty({
      type: this.type,
      profileId: this.id,
    });

    return this.decision;
  }
}

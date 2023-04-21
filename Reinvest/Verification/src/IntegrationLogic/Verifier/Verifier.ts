import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';
import { VerificationDecision, VerificationDecisionType } from 'Verification/Domain/ValueObject/VerificationDecision';
import {
  VerificationEvent,
  VerificationNorthCapitalEvent,
  VerificationResultEvent,
  VerificationStatus,
} from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerificationState, Verifier, VerifierType } from 'Verification/Domain/ValueObject/Verifiers';

export class ProfileVerifier implements Verifier {
  private northCapitalAdapter: VerificationNorthCapitalAdapter;
  private ncId: string;
  private id: string;
  private events: VerificationState['events'];
  private decision: VerificationDecision;
  private type: VerifierType;

  constructor(northCapitalAdapter: VerificationNorthCapitalAdapter, { ncId, id, events, decision, type }: VerificationState) {
    this.northCapitalAdapter = northCapitalAdapter;
    this.ncId = ncId;
    this.id = id;
    this.events = events;
    this.decision = decision;
    this.type = type;
    this.init();
  }

  private init(): void {
    if (!this.events?.list) {
      this.events.list = [];
    }

    if (!this.decision?.decision) {
      this.decision = this.makeDecision();
    }
  }

  handleVerificationEvent(event: VerificationEvent): void {
    const { ncId } = event;

    if (ncId !== this.ncId) {
      console.error('Verification event is not for this party', event);

      return;
    }

    if (this.wasEventSeen(event)) {
      return;
    }

    // if (!this.isEventAllowedInCurrentState(event)) {
    //   return;
    // }

    this.events.list.push(event);
  }

  async verify(): Promise<VerificationDecision> {
    let decision = this.makeDecision();

    if ([VerificationDecisionType.REQUEST_VERIFICATION].includes(decision.decision)) {
      const verificationResult = await this.northCapitalAdapter.verifyParty(this.ncId);

      verificationResult?.forEach(event => {
        this.handleVerificationEvent(event);
      });

      decision = this.makeDecision();
    } else if ([VerificationDecisionType.MANUAL_REVIEW_REQUIRED, VerificationDecisionType.UPDATE_REQUIRED].includes(decision.decision)) {
      const verificationResult = await this.northCapitalAdapter.getPartyVerificationStatus(this.ncId);

      verificationResult?.forEach(event => {
        this.handleVerificationEvent(event);
      });

      decision = this.makeDecision();
    }

    this.decision = decision;

    return decision;
  }

  getVerificationState(): VerificationState {
    return {
      decision: this.decision,
      events: this.events,
      id: this.id,
      ncId: this.ncId,
      type: this.type,
    };
  }

  private wasEventSeen(newEvent: VerificationEvent): boolean {
    // result event with the same id
    if (newEvent.kind === 'VerificationResult') {
      const { eventId } = <VerificationResultEvent>newEvent;
      const eventExists = this.events.list.find(
        (event: VerificationEvent) => event.kind === 'VerificationResult' && (<VerificationResultEvent>event).eventId === eventId,
      );

      return !!eventExists;
    }

    // administrative or user event with the same name
    const lastEvent = this.events.list[this.events.list.length - 1];

    if (lastEvent && 'name' in newEvent && 'name' in lastEvent) {
      return lastEvent.name === newEvent.name;
    }

    return false;
  }

  private makeDecision(): VerificationDecision {
    let amlStatus = VerificationStatus.PENDING;
    let kycStatus = VerificationStatus.PENDING;
    let kycCounter = 0;
    let someReasons: string[] = [];
    let decision: VerificationDecisionType = VerificationDecisionType.REQUEST_VERIFICATION;
    let wasFailedRequest = false;

    for (const event of this.events.list) {
      const { kind } = event;
      wasFailedRequest = false;

      if (kind === 'VerificationResult') {
        const { type, status, reasons } = <VerificationResultEvent>event;

        if (type === 'AML') {
          amlStatus = status;
        }

        if (type === 'KYC' && kycStatus !== status) {
          kycStatus = status;
          kycCounter++;
          someReasons = reasons;
        }
      }

      if (kind === 'VerificationNorthCapitalEvent') {
        const { name, reason } = <VerificationNorthCapitalEvent>event;

        if (name === 'REQUEST_FAILED') {
          wasFailedRequest = true;
          someReasons = [reason];
        }
      }
    }

    if (wasFailedRequest) {
      decision = VerificationDecisionType.WAIT_FOR_SUPPORT;

      return { decision, reasons: someReasons };
    }

    if (amlStatus === VerificationStatus.DISAPPROVED) {
      decision = VerificationDecisionType.PROFILE_BANNED;

      return { decision };
    }

    if (kycStatus === VerificationStatus.DISAPPROVED) {
      if (kycCounter <= 1) {
        decision = VerificationDecisionType.UPDATE_REQUIRED;
      }

      if (kycCounter === 2) {
        decision = VerificationDecisionType.MANUAL_REVIEW_REQUIRED;
      }

      if (kycCounter >= 3) {
        decision = VerificationDecisionType.PROFILE_BANNED;
      }

      return { decision, reasons: someReasons };
    }

    if (kycStatus === VerificationStatus.APPROVED && amlStatus === VerificationStatus.APPROVED) {
      decision = VerificationDecisionType.APPROVED;

      return { decision };
    }

    return { decision };
  }

  // private isEventAllowedInCurrentState(event: VerificationEvent): boolean {
  //   const { decision } = this.decision;
  //
  //
  //
  //   return false;
  // }
}

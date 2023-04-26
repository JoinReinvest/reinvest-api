import { AvailableEventsForDecision, VerificationDecision, VerificationDecisionType } from 'Verification/Domain/ValueObject/VerificationDecision';
import {
  VerificationAmlResultEvent,
  VerificationEvent,
  VerificationEvents,
  VerificationKycResultEvent,
  VerificationNorthCapitalObjectFailedEvent,
  VerificationResultEvent,
  VerificationStatus,
} from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerificationState, VerifierType } from 'Verification/Domain/ValueObject/Verifiers';

export abstract class AbstractVerifier {
  protected ncId: string;
  protected id: string;
  protected events: VerificationState['events'];
  protected decision: VerificationDecision;
  protected type: VerifierType;

  constructor({ ncId, id, events, decision, type }: VerificationState) {
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
      this.decision = {
        decision: VerificationDecisionType.UNKNOWN,
        onObject: {
          type: this.type,
        },
      };
    }
  }

  protected analyzeEvents(): {
    amlStatus: VerificationStatus;
    kycCounter: number;
    kycStatus: VerificationStatus;
    objectUpdatesCounter: number;
    reasons: string[];
    wasFailedRequest: boolean;
  } {
    let amlStatus = VerificationStatus.PENDING;
    let kycStatus = VerificationStatus.PENDING;
    let objectUpdatesCounter = 0;
    let kycCounter = 0;
    let someReasons: string[] = [];
    let wasFailedRequest = false;

    for (const event of this.events.list) {
      const { kind } = event;
      wasFailedRequest = false;

      if (kind === VerificationEvents.VERIFICATION_KYC_RESULT) {
        const { status, reasons } = <VerificationKycResultEvent>event;
        kycStatus = status;
        kycCounter++;
        someReasons = reasons;
      }

      if (kind === VerificationEvents.VERIFICATION_AML_RESULT) {
        const { status } = <VerificationAmlResultEvent>event;
        amlStatus = status;
      }

      if (kind === VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED) {
        const { reason } = <VerificationNorthCapitalObjectFailedEvent>event;
        wasFailedRequest = true;
        someReasons = [reason];
      }

      if (kind === VerificationEvents.VERIFICATION_REQUESTED_OBJECT_UPDATED) {
        objectUpdatesCounter++;
      }

      if (kind === VerificationEvents.VERIFICATION_RECOVERED_ADMINISTRATIVE) {
        wasFailedRequest = false;
        someReasons = [];
      }
    }

    return {
      amlStatus,
      kycStatus,
      kycCounter,
      reasons: someReasons,
      wasFailedRequest,
      objectUpdatesCounter,
    };
  }

  protected handleEvent(event: VerificationEvent, availableEvents: AvailableEventsForDecision): void {
    const { ncId } = event;

    if (ncId !== this.ncId) {
      console.error('Verification event is not for this party', event);

      return;
    }

    if (!this.canThisEventBeHandled(event, availableEvents)) {
      console.error('Wrong verification event in the current state', event, this.decision);

      return;
    }

    if (this.wasEventSeen(event)) {
      return;
    }

    this.events.list.push(event);
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

  protected wasEventSeen(newEvent: VerificationEvent): boolean {
    const verificationResultsEvents = [VerificationEvents.VERIFICATION_KYC_RESULT, VerificationEvents.VERIFICATION_AML_RESULT];

    // result event with the same id
    if (verificationResultsEvents.includes(newEvent.kind)) {
      const { eventId } = <VerificationResultEvent>newEvent;
      const eventExists = this.events.list.find(
        (event: VerificationEvent) => verificationResultsEvents.includes(event.kind) && (<VerificationResultEvent>event).eventId === eventId,
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

  getPartyId(): string {
    return this.ncId;
  }

  canBeUpdated(): boolean {
    return [
      VerificationDecisionType.UPDATE_REQUIRED,
      VerificationDecisionType.SECOND_UPDATE_REQUIRED,
      VerificationDecisionType.ENTITY_UPDATE_REQUIRED,
    ].includes(this.decision.decision);
  }

  private canThisEventBeHandled(event: VerificationEvent, availableEvents: AvailableEventsForDecision) {
    const { decision } = this.decision;
    const { kind } = event;

    if (availableEvents['ANY_TIME'] && availableEvents['ANY_TIME'].includes(kind)) {
      return true;
    }

    // @ts-ignore
    if (availableEvents[decision] && availableEvents[decision].includes(kind)) {
      return true;
    }

    return false;
  }
}

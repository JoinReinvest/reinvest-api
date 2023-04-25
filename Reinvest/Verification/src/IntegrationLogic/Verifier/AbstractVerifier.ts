import { VerificationDecision, VerificationDecisionType } from 'Verification/Domain/ValueObject/VerificationDecision';
import {
  VerificationAdministrativeEvent,
  VerificationEvent,
  VerificationNorthCapitalEvent,
  VerificationResultEvent,
  VerificationStatus,
  VerificationUserEvent,
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
    reasons: string[];
    wasFailedRequest: boolean;
  } {
    let amlStatus = VerificationStatus.PENDING;
    let kycStatus = VerificationStatus.PENDING;
    let kycCounter = 0;
    let someReasons: string[] = [];
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

      if (kind === 'VerificationAdministrativeEvent') {
        const { name } = <VerificationAdministrativeEvent>event;

        if (name === 'VERIFICATION_RECOVERED') {
          wasFailedRequest = false;
          someReasons = [];
        }
      }
    }

    return {
      amlStatus,
      kycStatus,
      kycCounter,
      reasons: someReasons,
      wasFailedRequest,
    };
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

  getPartyId(): string {
    return this.ncId;
  }

  recover(): void {
    this.handleVerificationEvent(<VerificationAdministrativeEvent>{
      kind: 'VerificationAdministrativeEvent',
      name: 'VERIFICATION_RECOVERED',
      date: new Date(),
      ncId: this.ncId,
    });
  }

  notifyAboutUpdate(): void {
    this.handleVerificationEvent(<VerificationUserEvent>{
      kind: 'VerificationUserEvent',
      name: 'OBJECT_UPDATED',
      date: new Date(),
      ncId: this.ncId,
    });
  }

  canBeUpdated(): boolean {
    return this.decision.decision === VerificationDecisionType.UPDATE_REQUIRED;
  }
}

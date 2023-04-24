import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';
import { VerificationDecision, VerificationDecisionType, VerificationObject } from 'Verification/Domain/ValueObject/VerificationDecision';
import {
  VerificationEvent,
  VerificationNorthCapitalEvent,
  VerificationResultEvent,
  VerificationStatus,
} from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerificationState, VerifierType } from 'Verification/Domain/ValueObject/Verifiers';

export class PartyVerifier {
  protected northCapitalAdapter: VerificationNorthCapitalAdapter;
  protected ncId: string;
  protected id: string;
  protected events: VerificationState['events'];
  protected decision: VerificationDecision;
  protected type: VerifierType;

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
      this.decision = {
        decision: VerificationDecisionType.UNKNOWN,
        onObject: {
          type: this.type,
        },
      };
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
    }

    return {
      amlStatus,
      kycStatus,
      kycCounter,
      reasons: someReasons,
      wasFailedRequest,
    };
  }

  protected async verifyParty(decision: VerificationDecision): Promise<boolean> {
    if ([VerificationDecisionType.REQUEST_VERIFICATION].includes(decision.decision)) {
      const verificationResult = await this.northCapitalAdapter.verifyParty(this.ncId);

      verificationResult?.forEach(event => {
        this.handleVerificationEvent(event);
      });

      return true;
    } else if ([VerificationDecisionType.MANUAL_REVIEW_REQUIRED, VerificationDecisionType.UPDATE_REQUIRED].includes(decision.decision)) {
      const verificationResult = await this.northCapitalAdapter.getPartyVerificationStatus(this.ncId);

      verificationResult?.forEach(event => {
        this.handleVerificationEvent(event);
      });

      return true;
    }

    return false;
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

  protected makeDecisionForParty(onObject: VerificationObject): VerificationDecision {
    let decision: VerificationDecisionType = VerificationDecisionType.REQUEST_VERIFICATION;
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

    if (amlStatus === VerificationStatus.DISAPPROVED) {
      decision = this.isProfile() ? VerificationDecisionType.PROFILE_BANNED : VerificationDecisionType.ACCOUNT_BANNED;

      return {
        decision,
        onObject,
        reasons: ['AML verification failed'],
      };
    }

    if (kycStatus === VerificationStatus.DISAPPROVED) {
      if (kycCounter <= 1) {
        decision = VerificationDecisionType.UPDATE_REQUIRED;
      }

      if (kycCounter === 2) {
        decision = VerificationDecisionType.MANUAL_REVIEW_REQUIRED;
      }

      if (kycCounter >= 3) {
        decision = this.isProfile() ? VerificationDecisionType.PROFILE_BANNED : VerificationDecisionType.ACCOUNT_BANNED;
        someReasons = ['Manual KYC verification failed'];
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

  private isProfile(): boolean {
    return this.type === VerifierType.PROFILE;
  }
}

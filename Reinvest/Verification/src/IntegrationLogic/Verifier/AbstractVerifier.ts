import { AvailableEventsForDecision, VerificationDecision, VerificationDecisionType } from 'Verification/Domain/ValueObject/VerificationDecision';
import {
  AutomaticVerificationResultEvent,
  VerificationAmlResultEvent,
  VerificationEvent,
  VerificationEvents,
  VerificationKycResultEvent,
  VerificationNorthCapitalObjectFailedEvent,
  VerificationStatus,
} from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerificationState, VerifierType } from 'Verification/Domain/ValueObject/Verifiers';

export abstract class AbstractVerifier {
  protected ncId: string;
  protected id: string;
  protected events: VerificationState['events'];
  protected decision: VerificationDecision;
  protected type: VerifierType;
  protected accountId: string | null;

  constructor({ ncId, id, events, decision, type, accountId }: VerificationState) {
    this.ncId = ncId;
    this.id = id;
    this.events = events;
    this.decision = decision;
    this.type = type;
    this.accountId = accountId;
    this.init();
  }

  getVerificationState(): VerificationState {
    return {
      accountId: this.accountId,
      decision: this.decision,
      events: this.events,
      id: this.id,
      ncId: this.ncId,
      type: this.type,
    };
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

  protected analyzeEvents(): {
    amlStatus: VerificationStatus;
    decisionId: number;
    failedKycCounter: number;
    isKycInPendingState: boolean;
    kycStatus: VerificationStatus;
    needMoreInfo: boolean;
    objectUpdatesCounter: number;
    reasons: string[];
    wasFailedRequest: boolean;
  } {
    let amlStatus = VerificationStatus.PENDING;
    let kycStatus = VerificationStatus.PENDING;
    let objectUpdatesCounter = 0;
    let failedKycCounter = 0;
    let someReasons: string[] = [];
    let wasFailedRequest = false;
    let isKycInPendingState = false;
    let needMoreInfo = false;
    const decisionId = this.events.list.length;

    for (const event of this.events.list) {
      const { kind } = event;
      wasFailedRequest = false;

      if ([VerificationEvents.VERIFICATION_KYC_RESULT, VerificationEvents.MANUAL_VERIFICATION_KYC_RESULT].includes(kind)) {
        isKycInPendingState = false; // kyc result event means that kyc is not in pending state anymore
        const { status, reasons } = <VerificationKycResultEvent>event;

        if (status === VerificationStatus.NEED_MORE_INFO) {
          needMoreInfo = true;
        } else {
          kycStatus = status;
        }

        someReasons = reasons;

        if (status === VerificationStatus.DISAPPROVED) {
          failedKycCounter++;
        }
      }

      if ([VerificationEvents.VERIFICATION_AML_RESULT, VerificationEvents.MANUAL_VERIFICATION_AML_RESULT].includes(kind)) {
        const { status, reasons } = <VerificationAmlResultEvent>event;

        if (status === VerificationStatus.NEED_MORE_INFO) {
          needMoreInfo = true;
          someReasons = reasons;
        } else {
          amlStatus = status;
        }
      }

      if (kind === VerificationEvents.VERIFICATION_REQUESTED_OBJECT_UPDATED) {
        if (needMoreInfo) {
          needMoreInfo = false;
        } else {
          objectUpdatesCounter++;
        }
      }

      if (kind === VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED) {
        const { reason } = <VerificationNorthCapitalObjectFailedEvent>event;
        wasFailedRequest = true;
        someReasons = [reason];
      }

      if (kind === VerificationEvents.VERIFICATION_RECOVERED_ADMINISTRATIVE) {
        wasFailedRequest = false;
        someReasons = [];
      }

      if (kind === VerificationEvents.VERIFICATION_KYC_SET_TO_PENDING) {
        isKycInPendingState = true;
      }

      if ([VerificationEvents.VERIFICATION_USER_OBJECT_UPDATED, VerificationEvents.VERIFICATION_CLEANED_ADMINISTRATIVE].includes(kind)) {
        // user object was updated, reset all statuses
        amlStatus = VerificationStatus.PENDING;
        kycStatus = VerificationStatus.PENDING;
        objectUpdatesCounter = 0;
        failedKycCounter = 0;
        someReasons = [];
        wasFailedRequest = false;
        isKycInPendingState = false;
        needMoreInfo = false;
      }
    }

    return {
      amlStatus,
      decisionId,
      kycStatus,
      failedKycCounter,
      reasons: someReasons,
      wasFailedRequest,
      needMoreInfo,
      objectUpdatesCounter,
      isKycInPendingState,
    };
  }

  protected handleEvent(event: VerificationEvent, availableEvents: AvailableEventsForDecision): void {
    const { ncId } = event;

    if (ncId !== this.ncId) {
      console.error('Verification event is not for this party', event);

      return;
    }

    if (this.wasEventSeen(event)) {
      return;
    }

    if (!this.canThisEventBeHandled(event, availableEvents)) {
      console.error('Wrong verification event in the current state', event, this.decision);

      return;
    }

    this.events.list.push(event);
  }

  protected wasEventSeen(newEvent: VerificationEvent): boolean {
    const verificationResultsEvents = [VerificationEvents.VERIFICATION_KYC_RESULT, VerificationEvents.VERIFICATION_AML_RESULT];

    // result event with the same id
    if (verificationResultsEvents.includes(newEvent.kind)) {
      const { eventId } = <AutomaticVerificationResultEvent>newEvent;
      const eventExists = this.events.list.find(
        (event: VerificationEvent) => verificationResultsEvents.includes(event.kind) && (<AutomaticVerificationResultEvent>event).eventId === eventId,
      );

      return !!eventExists;
    }

    // administrative or user event with the same name
    const lastEvent = this.events.list[this.events.list.length - 1];

    if (lastEvent) {
      return lastEvent.kind === newEvent.kind;
    }

    return false;
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

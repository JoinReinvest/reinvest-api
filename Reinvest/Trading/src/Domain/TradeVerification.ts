import crypto from 'crypto';
import { DateTime } from 'Money/DateTime';

export enum TradeVerificationDecision {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  NEED_MORE_INFO = 'NEED_MORE_INFO',
}

export enum TradeApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DISAPPROVED = 'disapproved',
  UNDER_REVIEW = 'under review',
}

export type TradeApproval = {
  approvalStatus: TradeApprovalStatus;
  changeDate: string;
  message: string;
};

export type TradeVerificationEvent = {
  // rr approval status
  approvalStatus: TradeApprovalStatus;
  date: string;
  // field3
  message: string;
  parsedMessage: {
    date: string;
    messageProvided: boolean;
    objectIds: string[];
  };
  uniqueId: string;
};

export type TradeVerificationState = {
  decision: TradeVerificationDecision;
  events: TradeVerificationEvent[];
};

export class TradeVerification {
  private tradeVerificationState: TradeVerificationState;

  constructor(tradeVerificationState?: TradeVerificationState) {
    this.tradeVerificationState = tradeVerificationState ?? {
      decision: TradeVerificationDecision.PENDING,
      events: <TradeVerificationEvent[]>[],
    };
  }

  handle(tradeApproval: TradeApproval): void {
    const { message, approvalStatus } = tradeApproval;
    const { parsedMessage, uniqueId } = this.parseTradeApproval(tradeApproval);

    this.handleEvent(<TradeVerificationEvent>{
      uniqueId,
      date: DateTime.now().toIsoDateTime(),
      message,
      parsedMessage,
      approvalStatus,
    });
  }

  makeDecision(): void {
    const lastEvent = this.getLastEvent();
    switch (lastEvent?.approvalStatus) {
      case TradeApprovalStatus.APPROVED:
        this.tradeVerificationState.decision = TradeVerificationDecision.VERIFIED;
        break;
      case TradeApprovalStatus.DISAPPROVED:
        this.tradeVerificationState.decision = TradeVerificationDecision.REJECTED;
        break;
      case TradeApprovalStatus.UNDER_REVIEW:
      case TradeApprovalStatus.PENDING:
        this.tradeVerificationState.decision = lastEvent.parsedMessage.messageProvided
          ? TradeVerificationDecision.NEED_MORE_INFO
          : TradeVerificationDecision.PENDING;
        break;
      default:
        this.tradeVerificationState.decision = TradeVerificationDecision.PENDING;
        break;
    }
  }

  private handleEvent(event: TradeVerificationEvent): void {
    const lastEvent = this.getLastEvent();

    if (!lastEvent || lastEvent.uniqueId !== event.uniqueId) {
      this.tradeVerificationState.events.push(event);
    }
  }

  private parseTradeApproval(tradeApproval: TradeApproval) {
    const { approvalStatus, changeDate, message } = tradeApproval;
    const uniqueId = crypto.createHash('sha1').update(`${approvalStatus}${message}${changeDate}`).digest('hex');

    return {
      uniqueId,
      parsedMessage: this.parseMessage(message, changeDate),
    };
  }

  private parseMessage(message: string, changeDate: string) {
    let date = message.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/)?.[0];
    const objectIds = message.match(/([P|E]\d+)/gi) ?? [];

    if (!date) {
      date = changeDate;
    }

    return {
      date,
      messageProvided: !!message.trim(),
      objectIds,
    };
  }

  toObject(): TradeVerificationState {
    return this.tradeVerificationState;
  }

  isVerified(): boolean {
    return this.tradeVerificationState.decision === TradeVerificationDecision.VERIFIED;
  }

  isRejected(): boolean {
    return this.tradeVerificationState.decision === TradeVerificationDecision.REJECTED;
  }

  isPending(): boolean {
    return (
      this.tradeVerificationState.decision === TradeVerificationDecision.PENDING ||
      this.tradeVerificationState.decision === TradeVerificationDecision.NEED_MORE_INFO ||
      !this.tradeVerificationState.decision
    );
  }

  getLastEvent(): TradeVerificationEvent | null {
    if (!this.tradeVerificationState.events.length) {
      return null;
    }

    return this.tradeVerificationState.events[this.tradeVerificationState.events.length - 1]!;
  }

  getObjectIds(): string[] {
    const lastEvent = this.getLastEvent();

    if (!lastEvent) {
      return [];
    }

    return lastEvent.parsedMessage.objectIds;
  }

  needMoreInfo(): boolean {
    return this.tradeVerificationState.decision === TradeVerificationDecision.NEED_MORE_INFO;
  }
}

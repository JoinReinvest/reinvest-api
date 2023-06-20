export enum TradeVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  NEED_MORE_INFO = 'NEED_MORE_INFO',
}

export type TradeVerificationEvent = {
  date: string;
  decision: string;
  // field3
  message: string;
  parsedMessage: {
    date: string;
    objectIds: string[];
  };
  // rr approval status
  status: TradeVerificationStatus;
};

export type TradeVerificationState = {
  events: TradeVerificationEvent[];
  status: TradeVerificationStatus;
};

export class TradeVerification {
  private tradeVerificationState: TradeVerificationState;

  constructor(tradeVerificationState?: TradeVerificationState) {
    this.tradeVerificationState = tradeVerificationState ?? {
      status: TradeVerificationStatus.PENDING,
      events: <TradeVerificationEvent[]>[],
    };
  }
}

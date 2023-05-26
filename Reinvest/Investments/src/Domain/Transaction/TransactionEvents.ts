import { DomainEvent } from 'SimpleAggregator/Types';

export enum TransactionEvents {
  INVESTMENT_CREATED = 'INVESTMENT_CREATED',
  ACCOUNT_VERIFIED_FOR_INVESTMENT = 'ACCOUNT_VERIFIED_FOR_INVESTMENT',
  INVESTMENT_FINALIZED = 'INVESTMENT_FINALIZED',
  TRADE_CREATED = 'TRADE_CREATED',
  INVESTMENT_FUNDED = 'INVESTMENT_FUNDED',
  INVESTMENT_APPROVED = 'INVESTMENT_APPROVED',
  GRACE_PERIOD_ENDED = 'GRACE_PERIOD_ENDED',
  MARKED_AS_READY_TO_DISBURSE = 'MARKED_AS_READY_TO_DISBURSE',
  INVESTMENT_SHARES_TRANSFERRED = 'INVESTMENT_SHARES_TRANSFERRED',
}

export type TransactionEvent = DomainEvent & {
  data: unknown;
  date: Date;
  id: string; // investment_id
  kind: TransactionEvents;
};

export type InvestmentCreated = TransactionEvent & {
  data: {
    accountId: string;
    amount: number;
    portfolioId: string;
    profileId: string;
  };
  kind: TransactionEvents.INVESTMENT_CREATED;
};

export type AccountVerifiedForInvestment = TransactionEvent & {
  data: {
    accountId: string;
  };
  kind: TransactionEvents.ACCOUNT_VERIFIED_FOR_INVESTMENT;
};

export type InvestmentFinalized = TransactionEvent & {
  data: {
    amount: number;
    bankAccountId: string;
    fees: number;
    ip: string;
    portfolioId: string;
    subscriptionAgreementId: string;
  };
  kind: TransactionEvents.INVESTMENT_FINALIZED;
};

export type TradeCreated = TransactionEvent & {
  data: {
    accountId: string;
    amount: number;
    fees: number;
    shares: string;
    unitSharePrice: number;
  };
  kind: TransactionEvents.TRADE_CREATED;
};

export type InvestmentFunded = TransactionEvent & {
  kind: TransactionEvents.INVESTMENT_FUNDED;
};

export type InvestmentApproved = TransactionEvent & {
  kind: TransactionEvents.INVESTMENT_APPROVED;
};

export type GracePeriodEnded = TransactionEvent & {
  kind: TransactionEvents.GRACE_PERIOD_ENDED;
};

export type InvestmentMarkedAsReadyToDisburse = TransactionEvent & {
  kind: TransactionEvents.MARKED_AS_READY_TO_DISBURSE;
};

export type InvestmentSharesTransferred = TransactionEvent & {
  kind: TransactionEvents.INVESTMENT_SHARES_TRANSFERRED;
};

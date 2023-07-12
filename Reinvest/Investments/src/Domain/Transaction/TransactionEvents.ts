import { DomainEvent } from 'SimpleAggregator/Types';

export enum TransactionEvents {
  INVESTMENT_CREATED = 'INVESTMENT_CREATED',
  INVESTMENT_CANCELED = 'INVESTMENT_CANCELED',
  INVESTMENT_REJECTED_BY_PRINCIPAL = 'INVESTMENT_REJECTED_BY_PRINCIPAL',
  ACCOUNT_VERIFIED_FOR_INVESTMENT = 'ACCOUNT_VERIFIED_FOR_INVESTMENT',
  VERIFICATION_REJECTED_FOR_INVESTMENT = 'VERIFICATION_REJECTED_FOR_INVESTMENT',
  INVESTMENT_FINALIZED = 'INVESTMENT_FINALIZED',
  TRADE_CREATED = 'TRADE_CREATED',
  INVESTMENT_FUNDED = 'INVESTMENT_FUNDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_MISMATCH = 'PAYMENT_MISMATCH',
  PAYMENT_RETRIED = 'PAYMENT_RETRIED',
  INVESTMENT_APPROVED = 'INVESTMENT_APPROVED',
  GRACE_PERIOD_ENDED = 'GRACE_PERIOD_ENDED',
  MARKED_AS_READY_TO_DISBURSE = 'MARKED_AS_READY_TO_DISBURSE',
  INVESTMENT_SHARES_TRANSFERRED = 'INVESTMENT_SHARES_TRANSFERRED',
  TRANSACTION_CANCELED = 'TRANSACTION_CANCELED',
  TRANSACTION_CANCELED_UNWINDING = 'TRANSACTION_CANCELED_UNWINDING',
  TRANSACTION_CANCELED_FAILED = 'TRANSACTION_CANCELED_FAILED',
  INVESTMENT_FINISHED = 'INVESTMENT_FINISHED',
  SECOND_PAYMENT_FAILED = 'SECOND_PAYMENT_FAILED',
  TRANSACTION_REVERTED = 'TRANSACTION_REVERTED',
  TRANSACTION_REVERTED_UNWINDING = 'TRANSACTION_REVERTED_UNWINDING',
  TRANSACTION_REVERTED_FAILED = 'TRANSACTION_REVERTED_FAILED',
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
    parentId: string | null;
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

export type InvestmentCanceled = TransactionEvent & {
  kind: TransactionEvents.INVESTMENT_CANCELED;
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
    shares: number;
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

export type TransactionCanceledFailed = TransactionEvent & {
  data: {
    reason: string;
  };
  kind: TransactionEvents.TRANSACTION_CANCELED_FAILED;
};

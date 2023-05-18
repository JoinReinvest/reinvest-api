import { DomainEvent } from 'SimpleAggregator/Types';

export enum TransactionEvents {
  INVESTMENT_CREATED = 'INVESTMENT_CREATED',
  ACCOUNT_VERIFIED_FOR_INVESTMENT = 'ACCOUNT_VERIFIED_FOR_INVESTMENT',
  INVESTMENT_FINALIZED = 'INVESTMENT_FINALIZED',
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
    profileId: string;
    subscriptionAgreementId: string;
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
    fees: number;
  };
  kind: TransactionEvents.INVESTMENT_FINALIZED;
};

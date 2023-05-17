import { DomainEvent } from 'SimpleAggregator/Types';

export enum TransactionEvents {
  INVESTMENT_CREATED = 'INVESTMENT_CREATED',
}

export type TransactionEvent = DomainEvent & {
  data: unknown;
  date: Date;
  id: string; // investment_id
  kind: TransactionEvents;
};

export type InvestmentCreated = TransactionEvent & {
  data: {
    amount: number;
    fees: number;
  };
  kind: TransactionEvents.INVESTMENT_CREATED;
};

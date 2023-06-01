import { DomainEvent } from 'SimpleAggregator/Types';

export enum ReinvestmentEvents {
  DIVIDEND_REINVESTMENT_REQUESTED = 'DIVIDEND_REINVESTMENT_REQUESTED',
  SHARES_TRANSFERRED_FOR_REINVESTMENT = 'SHARES_TRANSFERRED_FOR_REINVESTMENT',
}

export type ReinvestmentEvent = DomainEvent & {
  data: unknown;
  date: Date;
  id: string; // dividend id
  kind: ReinvestmentEvents;
};

export type DividendReinvestmentRequested = ReinvestmentEvent & {
  data: {
    accountId: string;
    amount: number;
    portfolioId: string;
    profileId: string;
  };
  kind: ReinvestmentEvents.DIVIDEND_REINVESTMENT_REQUESTED;
};

export type SharesTransferredForReinvestment = ReinvestmentEvent & {
  data: {
    numberOfShares: number;
    unitPrice: number;
  };
  kind: ReinvestmentEvents.SHARES_TRANSFERRED_FOR_REINVESTMENT;
};

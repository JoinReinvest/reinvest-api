export enum ReinvestmentDecisions {
  AWAITING_REINVESTMENT = 'AWAITING_REINVESTMENT',
  TRANSFER_SHARES_FOR_REINVESTMENT = 'TRANSFER_SHARES_FOR_REINVESTMENT',
}

export type ReinvestmentDecision = {
  data: unknown;
  decisionId: number;
  dividendId: string;
  kind: ReinvestmentDecisions;
  profileId: string;
};

export type TransferReinvestmentSharesDecision = ReinvestmentDecision & {
  data: {
    accountId: string;
    amount: number;
    portfolioId: string;
  };
  kind: ReinvestmentDecisions.TRANSFER_SHARES_FOR_REINVESTMENT;
};

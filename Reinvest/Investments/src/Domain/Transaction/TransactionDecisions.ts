export enum TransactionDecisions {
  CREATE_TRADE = 'CREATE_TRADE',
  AWAITING_INVESTMENT = 'AWAITING_INVESTMENT',
  VERIFY_ACCOUNT = 'VERIFY_ACCOUNT',
  FINALIZE_INVESTMENT = 'FINALIZE_INVESTMENT', // check if fees are approved and return the investment details
}

export type TransactionDecision = {
  data: unknown;
  decisionId: number;
  investmentId: string;
  kind: TransactionDecisions;
  profileId: string;
};

export type VerifyAccountDecision = TransactionDecision & {
  data: {
    accountId: string;
  };
  kind: TransactionDecisions.VERIFY_ACCOUNT;
};

export type FinalizeInvestmentDecision = TransactionDecision & {
  kind: TransactionDecisions.FINALIZE_INVESTMENT;
};

export type CreateTradeDecision = TransactionDecision & {
  data: {
    accountId: string;
    amount: number;
    fees: number;
  };
  kind: TransactionDecisions.CREATE_TRADE;
};

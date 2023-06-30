export enum TransactionDecisions {
  CREATE_TRADE = 'CREATE_TRADE',
  AWAITING_INVESTMENT = 'AWAITING_INVESTMENT',
  VERIFY_ACCOUNT = 'VERIFY_ACCOUNT',
  FINALIZE_INVESTMENT = 'FINALIZE_INVESTMENT', // check if fees are approved and return the investment details
  CHECK_IS_INVESTMENT_FUNDED = 'CHECK_IS_INVESTMENT_FUNDED',
  CHECK_IS_INVESTMENT_APPROVED = 'CHECK_IS_INVESTMENT_APPROVED',
  CHECK_IF_GRACE_PERIOD_ENDED = 'CHECK_IF_GRACE_PERIOD_ENDED',
  MARK_FUNDS_AS_READY_TO_DISBURSE = 'MARK_FUNDS_AS_READY_TO_DISBURSE',
  TRANSFER_SHARES_WHEN_TRADE_SETTLED = 'TRANSFER_SHARES_WHEN_TRADE_SETTLED',
  FINISH_INVESTMENT = 'FINISH_INVESTMENT',
  CANCEL_TRANSACTION = 'CANCEL_TRANSACTION',
  DO_NOTHING = 'DO_NOTHING',
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
    bankAccountId: string;
    fees: number;
    ip: string;
    parentId: string;
    portfolioId: string;
    subscriptionAgreementId: string;
    userTradeId: string;
  };
  kind: TransactionDecisions.CREATE_TRADE;
};

export type CheckIsInvestmentFundedDecision = TransactionDecision & {
  kind: TransactionDecisions.CHECK_IS_INVESTMENT_FUNDED;
};

export type CheckIsInvestmentApprovedDecision = TransactionDecision & {
  kind: TransactionDecisions.CHECK_IS_INVESTMENT_APPROVED;
};

export type CheckIfGracePeriodEndedDecision = TransactionDecision & {
  kind: TransactionDecisions.CHECK_IF_GRACE_PERIOD_ENDED;
};

export type MarkFundsAsReadyToDisburseDecision = TransactionDecision & {
  kind: TransactionDecisions.MARK_FUNDS_AS_READY_TO_DISBURSE;
};

export type TransferSharesWhenTradeSettledDecision = TransactionDecision & {
  kind: TransactionDecisions.TRANSFER_SHARES_WHEN_TRADE_SETTLED;
};

export type CancelTransactionDecision = TransactionDecision & {
  kind: TransactionDecisions.CANCEL_TRANSACTION;
};

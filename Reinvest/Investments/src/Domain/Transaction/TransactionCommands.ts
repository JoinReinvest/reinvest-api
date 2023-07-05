import {
  CancelTransactionDecision,
  CheckIfGracePeriodEndedDecision,
  CheckIsInvestmentApprovedDecision,
  CheckIsInvestmentFundedDecision,
  CreateTradeDecision,
  FinalizeInvestmentDecision,
  MarkFundsAsReadyToDisburseDecision,
  TransferSharesWhenTradeSettledDecision,
  VerifyAccountDecision,
} from 'Investments/Domain/Transaction/TransactionDecisions';
import { DomainEvent } from 'SimpleAggregator/Types';

export enum TransactionCommands {
  VerifyAccountForInvestment = 'VerifyAccountForInvestment',
  FinalizeInvestment = 'FinalizeInvestment',
  CreateTrade = 'CreateTrade',
  CheckIsInvestmentFunded = 'CheckIsInvestmentFunded',
  CheckIsInvestmentApproved = 'CheckIsInvestmentApproved',
  CheckIsGracePeriodEnded = 'CheckIsGracePeriodEnded',
  MarkFundsAsReadyToDisburse = 'MarkFundsAsReadyToDisburse',
  TransferSharesWhenTradeSettled = 'TransferSharesWhenTradeSettled',
  CancelTransaction = 'CancelTransaction',
}

export const verifyAccountForInvestment = (decision: VerifyAccountDecision): DomainEvent => ({
  kind: TransactionCommands.VerifyAccountForInvestment,
  data: {
    accountId: decision.data.accountId,
    profileId: decision.profileId,
  },
  id: decision.investmentId,
});

export const finalizeInvestment = (decision: FinalizeInvestmentDecision): DomainEvent => ({
  kind: TransactionCommands.FinalizeInvestment,
  id: decision.investmentId,
});

export const createTrade = (decision: CreateTradeDecision): DomainEvent => ({
  kind: TransactionCommands.CreateTrade,
  id: decision.investmentId,
  data: {
    accountId: decision.data.accountId,
    amount: decision.data.amount,
    fees: decision.data.fees,
    ip: decision.data.ip,
    profileId: decision.profileId,
    bankAccountId: decision.data.bankAccountId,
    subscriptionAgreementId: decision.data.subscriptionAgreementId,
    portfolioId: decision.data.portfolioId,
    parentId: decision.data.parentId,
    userTradeId: decision.data.userTradeId,
  },
});

export const checkIsInvestmentFunded = (decision: CheckIsInvestmentFundedDecision): DomainEvent => ({
  kind: TransactionCommands.CheckIsInvestmentFunded,
  id: decision.investmentId,
});

export const checkIsInvestmentApproved = (decision: CheckIsInvestmentApprovedDecision): DomainEvent => ({
  kind: TransactionCommands.CheckIsInvestmentApproved,
  id: decision.investmentId,
});

export const checkIfGracePeriodEnded = (decision: CheckIfGracePeriodEndedDecision): DomainEvent => ({
  kind: TransactionCommands.CheckIsGracePeriodEnded,
  id: decision.investmentId,
});

export const markFundsAsReadyToDisburse = (decision: MarkFundsAsReadyToDisburseDecision): DomainEvent => ({
  kind: TransactionCommands.MarkFundsAsReadyToDisburse,
  id: decision.investmentId,
});

export const transferSharesWhenTradeSettled = (decision: TransferSharesWhenTradeSettledDecision): DomainEvent => ({
  kind: TransactionCommands.TransferSharesWhenTradeSettled,
  id: decision.investmentId,
});

export const cancelTransaction = (decision: CancelTransactionDecision): DomainEvent => ({
  kind: TransactionCommands.CancelTransaction,
  id: decision.investmentId,
});

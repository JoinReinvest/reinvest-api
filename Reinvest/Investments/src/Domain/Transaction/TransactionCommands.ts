import { CreateTradeDecision, FinalizeInvestmentDecision, VerifyAccountDecision } from 'Investments/Domain/Transaction/TransactionDecisions';
import { DomainEvent } from 'SimpleAggregator/Types';

export enum TransactionCommands {
  VerifyAccountForInvestment = 'VerifyAccountForInvestment',
  FinalizeInvestment = 'FinalizeInvestment',
  CreateTrade = 'CreateTrade',
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
  },
});

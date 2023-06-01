import { TransferReinvestmentSharesDecision } from 'Investments/Domain/Reinvestments/ReinvestmentDecisions';
import { DomainEvent } from 'SimpleAggregator/Types';

export enum ReinvestmentCommands {
  TransferSharesForReinvestment = 'TransferSharesForReinvestment',
}

export const transferSharesForReinvestment = (decision: TransferReinvestmentSharesDecision): DomainEvent => ({
  kind: ReinvestmentCommands.TransferSharesForReinvestment,
  data: {
    accountId: decision.data.accountId,
    profileId: decision.profileId,
    portfolioId: decision.data.portfolioId,
    amount: decision.data.amount,
  },
  id: decision.dividendId,
});

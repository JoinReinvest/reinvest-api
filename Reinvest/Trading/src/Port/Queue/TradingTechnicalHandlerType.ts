import { ContainerInterface } from 'Container/Container';
import { CheckIsInvestmentApprovedHandler } from 'Trading/Port/Queue/EventHandler/CheckIsInvestmentApprovedHandler';
import { CheckIsInvestmentFundedHandler } from 'Trading/Port/Queue/EventHandler/CheckIsInvestmentFundedHandler';
import { CreateTradeHandler } from 'Trading/Port/Queue/EventHandler/CreateTradeHandler';
import { MarkFundsAsReadyToDisburseHandler } from 'Trading/Port/Queue/EventHandler/MarkFundsAsReadyToDisburseHandler';
import { TransferSharesForReinvestmentHandler } from 'Trading/Port/Queue/EventHandler/TransferSharesForReinvestmentHandler';
import { TransferSharesWhenTradeSettledHandler } from 'Trading/Port/Queue/EventHandler/TransferSharesWhenTradeSettledHandler';

export type TradingTechnicalHandlerType = {
  CheckIsInvestmentApproved: CheckIsInvestmentApprovedHandler['handle'];
  CheckIsInvestmentFunded: CheckIsInvestmentFundedHandler['handle'];
  CreateTrade: CreateTradeHandler['handle'];
  MarkFundsAsReadyToDisburse: MarkFundsAsReadyToDisburseHandler['handle'];
  TransferSharesForReinvestment: TransferSharesForReinvestmentHandler['handle'];
  TransferSharesWhenTradeSettled: TransferSharesWhenTradeSettledHandler['handle'];
};

export const TradingTechnicalHandler = (container: ContainerInterface): TradingTechnicalHandlerType => ({
  CheckIsInvestmentApproved: container.delegateTo(CheckIsInvestmentApprovedHandler, 'handle'),
  TransferSharesWhenTradeSettled: container.delegateTo(TransferSharesWhenTradeSettledHandler, 'handle'),
  CreateTrade: container.delegateTo(CreateTradeHandler, 'handle'),
  CheckIsInvestmentFunded: container.delegateTo(CheckIsInvestmentFundedHandler, 'handle'),
  MarkFundsAsReadyToDisburse: container.delegateTo(MarkFundsAsReadyToDisburseHandler, 'handle'),
  TransferSharesForReinvestment: container.delegateTo(TransferSharesForReinvestmentHandler, 'handle'),
});

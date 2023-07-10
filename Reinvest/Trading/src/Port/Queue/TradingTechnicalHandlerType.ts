import { ContainerInterface } from 'Container/Container';
import { CancelTradeHandler } from 'Trading/Port/Queue/EventHandler/CancelTradeHandler';
import { CheckIsInvestmentApprovedHandler } from 'Trading/Port/Queue/EventHandler/CheckIsInvestmentApprovedHandler';
import { CheckIsInvestmentFundedHandler } from 'Trading/Port/Queue/EventHandler/CheckIsInvestmentFundedHandler';
import { CreateTradeHandler } from 'Trading/Port/Queue/EventHandler/CreateTradeHandler';
import { MarkFundsAsReadyToDisburseHandler } from 'Trading/Port/Queue/EventHandler/MarkFundsAsReadyToDisburseHandler';
import { RevertTradeHandler } from 'Trading/Port/Queue/EventHandler/RevertTradeHandler';
import { TransferSharesForReinvestmentHandler } from 'Trading/Port/Queue/EventHandler/TransferSharesForReinvestmentHandler';
import { TransferSharesWhenTradeSettledHandler } from 'Trading/Port/Queue/EventHandler/TransferSharesWhenTradeSettledHandler';

export type TradingTechnicalHandlerType = {
  CancelTransaction: CancelTradeHandler['handle'];
  CheckIsInvestmentApproved: CheckIsInvestmentApprovedHandler['handle'];
  CheckIsInvestmentFunded: CheckIsInvestmentFundedHandler['handle'];
  CreateTrade: CreateTradeHandler['handle'];
  MarkFundsAsReadyToDisburse: MarkFundsAsReadyToDisburseHandler['handle'];
  RevertTransaction: RevertTradeHandler['handle'];
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
  CancelTransaction: container.delegateTo(CancelTradeHandler, 'handle'),
  RevertTransaction: container.delegateTo(RevertTradeHandler, 'handle'),
});

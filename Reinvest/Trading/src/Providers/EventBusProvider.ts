import { ContainerInterface } from 'Container/Container';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';
import { Trading } from 'Trading/index';
import { CancelTrade, CancelTradeEvent } from 'Trading/IntegrationLogic/UseCase/CancelTrade';
import { CheckIsTradeApproved } from 'Trading/IntegrationLogic/UseCase/CheckIsTradeApproved';
import { CheckIsTradeFunded } from 'Trading/IntegrationLogic/UseCase/CheckIsTradeFunded';
import { CreateTrade } from 'Trading/IntegrationLogic/UseCase/CreateTrade';
import { MarkFundsAsReadyToDisburse } from 'Trading/IntegrationLogic/UseCase/MarkFundsAsReadyToDisburse';
import { TransferSharesForReinvestment } from 'Trading/IntegrationLogic/UseCase/TransferSharesForReinvestment';
import { TransferSharesWhenTradeSettled } from 'Trading/IntegrationLogic/UseCase/TransferSharesWhenTradeSettled';
import { CancelTradeHandler } from 'Trading/Port/Queue/EventHandler/CancelTradeHandler';
import { CheckIsInvestmentApprovedHandler } from 'Trading/Port/Queue/EventHandler/CheckIsInvestmentApprovedHandler';
import { CheckIsInvestmentFundedHandler } from 'Trading/Port/Queue/EventHandler/CheckIsInvestmentFundedHandler';
import { CreateTradeHandler } from 'Trading/Port/Queue/EventHandler/CreateTradeHandler';
import { MarkFundsAsReadyToDisburseHandler } from 'Trading/Port/Queue/EventHandler/MarkFundsAsReadyToDisburseHandler';
import { TransferSharesForReinvestmentHandler } from 'Trading/Port/Queue/EventHandler/TransferSharesForReinvestmentHandler';
import { TransferSharesWhenTradeSettledHandler } from 'Trading/Port/Queue/EventHandler/TransferSharesWhenTradeSettledHandler';

export default class EventBusProvider {
  private config: Trading.Config;

  constructor(config: Trading.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(CreateTradeHandler, [CreateTrade, SimpleEventBus]);
    container.addSingleton(CheckIsInvestmentFundedHandler, [CheckIsTradeFunded, SimpleEventBus]);
    container.addSingleton(CheckIsInvestmentApprovedHandler, [CheckIsTradeApproved, SimpleEventBus]);
    container.addSingleton(MarkFundsAsReadyToDisburseHandler, [MarkFundsAsReadyToDisburse, SimpleEventBus]);
    container.addSingleton(TransferSharesWhenTradeSettledHandler, [TransferSharesWhenTradeSettled, SimpleEventBus]);
    container.addSingleton(TransferSharesForReinvestmentHandler, [TransferSharesForReinvestment, SimpleEventBus]);
    container.addSingleton(CancelTradeHandler, [CancelTrade]);

    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    eventBus.subscribeHandlerForKinds(SendToQueueEventHandler.getClassName(), [
      'TradeCreated',
      'InvestmentFunded',
      'InvestmentApproved',
      'InvestmentRejected',
      'InvestmentMarkedAsReadyToDisburse',
      'InvestmentSharesTransferred',
      'ReinvestmentSharesTransferred',
      CancelTradeEvent.TransactionCanceled,
      CancelTradeEvent.TransactionUnwinding,
      CancelTradeEvent.TransactionCanceledFailed,
    ]);
  }
}

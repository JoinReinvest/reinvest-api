import { ContainerInterface } from 'Container/Container';
import { CheckIsGracePeriodEndedEventHandler } from 'Investments/Application/DomainEventHandler/CheckIsGracePeriodEndedEventHandler';
import { FinalizeInvestmentEventHandler } from 'Investments/Application/DomainEventHandler/FinalizeInvestmentEventHandler';
import { ReinvestmentEventHandler } from 'Investments/Application/DomainEventHandler/ReinvestmentEventHandler';
import { SharesEventHandler } from 'Investments/Application/DomainEventHandler/SharesEventHandler';
import { TransactionEventHandler } from 'Investments/Application/DomainEventHandler/TransactionEventHandler';
import { ReinvestmentExecutor } from 'Investments/Application/ReinvestmentProcessManager/ReinvestmentExecutor';
import { TransactionExecutor } from 'Investments/Application/TransactionProcessManager/TransactionExecutor';
import { ReinvestmentCommands } from 'Investments/Domain/Reinvestments/ReinvestmentCommands';
import { ReinvestmentEvents } from 'Investments/Domain/Reinvestments/ReinvestmentEvents';
import { TransactionCommands } from 'Investments/Domain/Transaction/TransactionCommands';
import { TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { Investments } from 'Investments/index';
import { SharesAndDividendService } from 'Investments/Infrastructure/Adapters/Modules/SharesAndDividendService';
import { InvestmentsQueryRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsQueryRepository';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { ReinvestmentRepository } from 'Investments/Infrastructure/Adapters/Repository/ReinvestmentRepository';
import { TransactionRepository } from 'Investments/Infrastructure/Adapters/Repository/TransactionRepository';
import { GeneratePdfEventHandler } from 'Investments/Infrastructure/Events/GeneratePdfEventHandler';
import { TechnicalToDomainEventsHandler } from 'Investments/Infrastructure/Events/TechnicalToDomainEventsHandler';
import { EventBus, SimpleEventBus, STORE_EVENT_COMMAND } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';

export default class EventBusProvider {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container
      .addSingleton(SharesEventHandler, [SharesAndDividendService])
      .addSingleton(TechnicalToDomainEventsHandler, [SimpleEventBus])
      .addSingleton(TransactionEventHandler, [TransactionRepository, TransactionExecutor, SharesEventHandler])
      .addSingleton(ReinvestmentEventHandler, [ReinvestmentRepository, ReinvestmentExecutor, SharesEventHandler])
      .addSingleton(CheckIsGracePeriodEndedEventHandler, [InvestmentsRepository, SimpleEventBus])
      .addSingleton(FinalizeInvestmentEventHandler, [InvestmentsQueryRepository, SimpleEventBus]);

    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    eventBus
      // input events
      .subscribeHandlerForKinds(TransactionEventHandler.getClassName(), [
        TransactionEvents.INVESTMENT_CREATED,
        TransactionEvents.ACCOUNT_VERIFIED_FOR_INVESTMENT,
        TransactionEvents.INVESTMENT_FINALIZED,
        TransactionEvents.TRADE_CREATED,
        TransactionEvents.INVESTMENT_FUNDED,
        TransactionEvents.INVESTMENT_APPROVED,
        TransactionEvents.GRACE_PERIOD_ENDED,
        TransactionEvents.MARKED_AS_READY_TO_DISBURSE,
        TransactionEvents.INVESTMENT_SHARES_TRANSFERRED,
        TransactionEvents.INVESTMENT_CANCELED,
        TransactionEvents.TRANSACTION_CANCELED,
        TransactionEvents.TRANSACTION_CANCELED_UNWINDING,
        TransactionEvents.TRANSACTION_CANCELED_FAILED,
      ])

      .subscribeHandlerForKinds(ReinvestmentEventHandler.getClassName(), [
        ReinvestmentEvents.DIVIDEND_REINVESTMENT_REQUESTED,
        ReinvestmentEvents.SHARES_TRANSFERRED_FOR_REINVESTMENT,
      ])

      // output commands
      // TODO handle finish investment decision
      .subscribe(TransactionCommands.FinalizeInvestment, FinalizeInvestmentEventHandler.getClassName())
      .subscribe(TransactionCommands.CheckIsGracePeriodEnded, CheckIsGracePeriodEndedEventHandler.getClassName())
      .subscribeHandlerForKinds(SendToQueueEventHandler.getClassName(), [
        STORE_EVENT_COMMAND,
        TransactionCommands.VerifyAccountForInvestment,
        TransactionCommands.CreateTrade,
        TransactionCommands.CheckIsInvestmentFunded,
        TransactionCommands.CheckIsInvestmentApproved,
        TransactionCommands.MarkFundsAsReadyToDisburse,
        TransactionCommands.TransferSharesWhenTradeSettled,
        ReinvestmentCommands.TransferSharesForReinvestment,
        TransactionCommands.CancelTransaction,
      ])
      .subscribe('GeneratePdfCommand', GeneratePdfEventHandler.getClassName());
  }
}

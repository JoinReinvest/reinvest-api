import { ContainerInterface } from 'Container/Container';
import { PdfKinds } from 'HKEKTypes/Pdf';
import { AgreementsEventHandler } from 'Investments/Application/DomainEventHandler/AgreementsEventHandler';
import { CheckIsGracePeriodEndedEventHandler } from 'Investments/Application/DomainEventHandler/CheckIsGracePeriodEndedEventHandler';
import { FinalizeInvestmentEventHandler } from 'Investments/Application/DomainEventHandler/FinalizeInvestmentEventHandler';
import { InvestmentStatusEventHandler } from 'Investments/Application/DomainEventHandler/InvestmentStatusEventHandler';
import { ReinvestmentEventHandler } from 'Investments/Application/DomainEventHandler/ReinvestmentEventHandler';
import { SharesEventHandler } from 'Investments/Application/DomainEventHandler/SharesEventHandler';
import { TransactionEventHandler } from 'Investments/Application/DomainEventHandler/TransactionEventHandler';
import { ReinvestmentExecutor } from 'Investments/Application/ReinvestmentProcessManager/ReinvestmentExecutor';
import { TransactionExecutor } from 'Investments/Application/TransactionProcessManager/TransactionExecutor';
import { GenerateSubscriptionAgreement } from 'Investments/Application/UseCases/GenerateSubscriptionAgreement';
import { SubscriptionAgreementEvents } from 'Investments/Domain/Investments/SubscriptionAgreement';
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
import { PdfGeneratedEventHandler } from 'Investments/Infrastructure/Events/PdfGeneratedEventHandler';
import { TechnicalToDomainEventsHandler } from 'Investments/Infrastructure/Events/TechnicalToDomainEventsHandler';
import { EventBus, SimpleEventBus, STORE_EVENT_COMMAND } from 'SimpleAggregator/EventBus/EventBus';
import { GeneratePdfEventHandler } from 'SimpleAggregator/EventBus/GeneratePdfEventHandler';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';
import { MarkSubscriptionAgreementAsGenerated } from 'Investments/Application/UseCases/MarkSubscriptionAgreementAsGenerated';

export default class EventBusProvider {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container
      .addSingleton(SharesEventHandler, [SharesAndDividendService])
      .addSingleton(InvestmentStatusEventHandler, [InvestmentsRepository])
      .addSingleton(TechnicalToDomainEventsHandler, [SimpleEventBus])
      .addSingleton(TransactionEventHandler, [TransactionRepository, TransactionExecutor, SharesEventHandler, InvestmentStatusEventHandler])
      .addSingleton(ReinvestmentEventHandler, [ReinvestmentRepository, ReinvestmentExecutor, SharesEventHandler])
      .addSingleton(CheckIsGracePeriodEndedEventHandler, [InvestmentsRepository, SimpleEventBus])
      .addSingleton(FinalizeInvestmentEventHandler, [InvestmentsQueryRepository, SimpleEventBus])
      .addSingleton(AgreementsEventHandler, [GenerateSubscriptionAgreement])
      .addSingleton(PdfGeneratedEventHandler, [MarkSubscriptionAgreementAsGenerated]);

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
        TransactionEvents.TRANSACTION_REVERTED,
        TransactionEvents.TRANSACTION_REVERTED_UNWINDING,
        TransactionEvents.TRANSACTION_REVERTED_FAILED,
        TransactionEvents.TRANSACTION_CANCELED,
        TransactionEvents.TRANSACTION_CANCELED_UNWINDING,
        TransactionEvents.TRANSACTION_CANCELED_FAILED,
        TransactionEvents.INVESTMENT_FINISHED,
        TransactionEvents.VERIFICATION_REJECTED_FOR_INVESTMENT,
        TransactionEvents.INVESTMENT_REJECTED_BY_PRINCIPAL,
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
        TransactionCommands.RevertTransaction,
      ])
      .subscribeHandlerForKinds(AgreementsEventHandler.getClassName(), [
        SubscriptionAgreementEvents.GenerateSubscriptionAgreementCommand,
        SubscriptionAgreementEvents.RecurringSubscriptionAgreementSigned,
        SubscriptionAgreementEvents.SubscriptionAgreementSigned,
      ])
      .subscribe(PdfKinds.GeneratePdf, GeneratePdfEventHandler.getClassName());
  }
}

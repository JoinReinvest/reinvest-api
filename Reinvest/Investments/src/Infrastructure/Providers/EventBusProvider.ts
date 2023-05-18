import { ContainerInterface } from 'Container/Container';
import { FinalizeInvestmentEventHandler } from 'Investments/Application/DomainEventHandler/FinalizeInvestmentEventHandler';
import { TransactionEventHandler } from 'Investments/Application/DomainEventHandler/TransactionEventHandler';
import { TransactionExecutor } from 'Investments/Application/TransactionProcessManager/TransactionExecutor';
import { TransactionCommands } from 'Investments/Domain/Transaction/TransactionCommands';
import { TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { TransactionRepository } from 'Investments/Infrastructure/Adapters/Repository/TransactionRepository';
import { TechnicalToDomainEventsHandler } from 'Investments/Infrastructure/Events/TechnicalToDomainEventsHandler';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';

import { Investments } from '../..';

export default class EventBusProvider {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container
      .addSingleton(TechnicalToDomainEventsHandler, [SimpleEventBus])
      .addSingleton(TransactionEventHandler, [TransactionRepository, TransactionExecutor])
      .addSingleton(FinalizeInvestmentEventHandler, [InvestmentsRepository, SimpleEventBus]);

    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    eventBus
      .subscribeHandlerForKinds(TransactionEventHandler.getClassName(), [
        TransactionEvents.INVESTMENT_CREATED,
        TransactionEvents.ACCOUNT_VERIFIED_FOR_INVESTMENT,
        TransactionEvents.INVESTMENT_FINALIZED,
      ])
      .subscribe(TransactionCommands.FinalizeInvestment, FinalizeInvestmentEventHandler.getClassName())
      .subscribeHandlerForKinds(SendToQueueEventHandler.getClassName(), [TransactionCommands.VerifyAccountForInvestment, TransactionCommands.CreateTrade]);
  }
}

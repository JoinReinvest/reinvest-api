import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';
import {
  createWithdrawalsDatabaseAdapterProvider,
  WithdrawalsDatabase,
  WithdrawalsDatabaseAdapterInstanceProvider,
  WithdrawalsDatabaseAdapterProvider,
} from 'Withdrawals/Adapter/Database/DatabaseAdapter';
import { DividendsRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/DividendsRequestsRepository';
import { FundsRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsRequestsRepository';
import { SharesAndDividendsService } from 'Withdrawals/Adapter/Module/SharesAndDividendsService';
import { WithdrawalsDocumentService } from 'Withdrawals/Adapter/Module/WithdrawalsDocumentService';
import { Withdrawals } from 'Withdrawals/index';

export class AdapterServiceProvider {
  private config: Withdrawals.Config;

  constructor(config: Withdrawals.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);

    container
      .addAsValue(SimpleEventBus.getClassName(), new SimpleEventBus(container))
      .addObjectFactory(QueueSender, () => new QueueSender(this.config.queue), [])
      .addObjectFactory(SendToQueueEventHandler, (queueSender: QueueSender) => new SendToQueueEventHandler(queueSender), [QueueSender]);

    // db
    container
      .addAsValue(WithdrawalsDatabaseAdapterInstanceProvider, createWithdrawalsDatabaseAdapterProvider(this.config.database))
      .addSingleton(FundsRequestsRepository, [WithdrawalsDatabaseAdapterInstanceProvider])
      .addSingleton(DividendsRequestsRepository, [WithdrawalsDatabaseAdapterInstanceProvider])
      .addObjectFactory(
        'WithdrawalTransactionalAdapter',
        (databaseProvider: WithdrawalsDatabaseAdapterProvider) => new TransactionalAdapter<WithdrawalsDatabase>(databaseProvider),
        [WithdrawalsDatabaseAdapterInstanceProvider],
      );

    // modules
    container.addSingleton(SharesAndDividendsService, ['SharesAndDividends']);
    container.addSingleton(WithdrawalsDocumentService, ['Documents']);
  }
}

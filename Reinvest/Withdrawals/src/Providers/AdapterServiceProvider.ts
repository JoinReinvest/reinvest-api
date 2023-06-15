import { ContainerInterface } from 'Container/Container';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';
import { createWithdrawalsDatabaseAdapterProvider, WithdrawalsDatabaseAdapterInstanceProvider } from 'Withdrawals/Adapter/Database/DatabaseAdapter';
import { FundsRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsRequestsRepository';
import { SharesAndDividendsDocumentService } from 'Withdrawals/Adapter/Module/SharesAndDividendsService';
import { WithdrawalsDocumentService } from 'Withdrawals/Adapter/Module/WithdrawalsDocumentService';
import { Withdrawals } from 'Withdrawals/index';

export class AdapterServiceProvider {
  private config: Withdrawals.Config;

  constructor(config: Withdrawals.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container
      .addAsValue(SimpleEventBus.getClassName(), new SimpleEventBus(container))
      .addObjectFactory(QueueSender, () => new QueueSender(this.config.queue), [])
      .addObjectFactory(SendToQueueEventHandler, (queueSender: QueueSender) => new SendToQueueEventHandler(queueSender), [QueueSender]);

    // db
    container
      .addAsValue(WithdrawalsDatabaseAdapterInstanceProvider, createWithdrawalsDatabaseAdapterProvider(this.config.database))
      .addSingleton(FundsRequestsRepository, [WithdrawalsDatabaseAdapterInstanceProvider]);

    // modules
    container.addSingleton(SharesAndDividendsDocumentService, ['SharesAndDividends']);
    container.addSingleton(WithdrawalsDocumentService, ['Documents']);
  }
}

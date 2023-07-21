import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { WithdrawalsDocumentsRepository } from 'Reinvest/Withdrawals/src/Adapter/Database/Repository/WithdrawalsDocumentsRepository';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { GeneratePdfEventHandler } from 'SimpleAggregator/EventBus/GeneratePdfEventHandler';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';
import {
  createWithdrawalsDatabaseAdapterProvider,
  WithdrawalsDatabase,
  WithdrawalsDatabaseAdapterInstanceProvider,
  WithdrawalsDatabaseAdapterProvider,
} from 'Withdrawals/Adapter/Database/DatabaseAdapter';
import { DividendsRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/DividendsRequestsRepository';
import { FundsWithdrawalRequestsAgreementsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsAgreementsRepository';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalsRepository } from 'Withdrawals/Adapter/Database/Repository/WithdrawalsRepository';
import { SharesAndDividendsService } from 'Withdrawals/Adapter/Module/SharesAndDividendsService';
import { WithdrawalDocumentsDataCollector } from 'Withdrawals/Adapter/Module/WithdrawalDocumentsDataCollector';
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
      .addObjectFactory(SendToQueueEventHandler, (queueSender: QueueSender) => new SendToQueueEventHandler(queueSender), [QueueSender])
      .addObjectFactory('PdfGeneratorQueueSender', () => new QueueSender(this.config.pdfGeneratorQueue), [])
      .addObjectFactory(GeneratePdfEventHandler, (queueSender: QueueSender) => new GeneratePdfEventHandler(queueSender), ['PdfGeneratorQueueSender']);

    // db
    container
      .addAsValue(WithdrawalsDatabaseAdapterInstanceProvider, createWithdrawalsDatabaseAdapterProvider(this.config.database))
      .addSingleton(FundsWithdrawalRequestsRepository, [WithdrawalsDatabaseAdapterInstanceProvider, SimpleEventBus])
      .addSingleton(FundsWithdrawalRequestsAgreementsRepository, [WithdrawalsDatabaseAdapterInstanceProvider])
      .addSingleton(DividendsRequestsRepository, [WithdrawalsDatabaseAdapterInstanceProvider])
      .addObjectFactory(
        'WithdrawalTransactionalAdapter',
        (databaseProvider: WithdrawalsDatabaseAdapterProvider) => new TransactionalAdapter<WithdrawalsDatabase>(databaseProvider),
        [WithdrawalsDatabaseAdapterInstanceProvider],
      )
      .addSingleton(WithdrawalsRepository, [WithdrawalsDatabaseAdapterInstanceProvider, SimpleEventBus])
      .addSingleton(WithdrawalsDocumentsRepository, [WithdrawalsDatabaseAdapterInstanceProvider, SimpleEventBus]);

    // modules
    container.addSingleton(SharesAndDividendsService, ['SharesAndDividends']);
    container.addSingleton(WithdrawalDocumentsDataCollector, ['LegalEntities', 'Portfolio', 'Registration', 'SharesAndDividends']);
  }
}

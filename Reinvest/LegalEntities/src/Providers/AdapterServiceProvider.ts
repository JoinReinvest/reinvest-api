import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import {
  createLegalEntitiesDatabaseAdapterProvider,
  LegalEntitiesDatabase,
  LegalEntitiesDatabaseAdapterInstanceProvider,
  LegalEntitiesDatabaseAdapterProvider,
} from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { DraftAccountRepository } from 'LegalEntities/Adapter/Database/Repository/DraftAccountRepository';
import { ProfileRepository } from 'LegalEntities/Adapter/Database/Repository/ProfileRepository';
import { DocumentsService } from 'LegalEntities/Adapter/Modules/DocumentsService';
import { InvestmentAccountsService } from 'LegalEntities/Adapter/Modules/InvestmentAccountsService';
import { LegalEntities } from 'LegalEntities/index';
import { CompleteDraftAccount } from 'LegalEntities/UseCases/CompleteDraftAccount';
import { CompleteProfile } from 'LegalEntities/UseCases/CompleteProfile';
import { CreateDraftAccount } from 'LegalEntities/UseCases/CreateDraftAccount';
import { RemoveDraftAccount } from 'LegalEntities/UseCases/RemoveDraftAccount';
import { TransformDraftAccountIntoRegularAccount } from 'LegalEntities/UseCases/TransformDraftAccountIntoRegularAccount';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';

export class AdapterServiceProvider {
  private config: LegalEntities.Config;

  constructor(config: LegalEntities.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // event bus + events queue sender
    container
      .addAsValue(SimpleEventBus.getClassName(), new SimpleEventBus(container))
      .addObjectFactory(QueueSender, () => new QueueSender(this.config.queue), [])
      .addObjectFactory(SendToQueueEventHandler, (queueSender: QueueSender) => new SendToQueueEventHandler(queueSender), [QueueSender]);

    container.addSingleton(IdGenerator);

    container.addSingleton(DocumentsService, ['Documents']).addSingleton(InvestmentAccountsService, ['InvestmentAccounts']);

    // database
    container
      .addAsValue(LegalEntitiesDatabaseAdapterInstanceProvider, createLegalEntitiesDatabaseAdapterProvider(this.config.database))
      .addSingleton(ProfileRepository, [LegalEntitiesDatabaseAdapterInstanceProvider, IdGenerator, SimpleEventBus])
      .addSingleton(DraftAccountRepository, [LegalEntitiesDatabaseAdapterInstanceProvider, IdGenerator])
      .addSingleton(AccountRepository, [LegalEntitiesDatabaseAdapterInstanceProvider])
      .addObjectFactory(
        'LegalEntitiesTransactionalAdapter',
        (databaseProvider: LegalEntitiesDatabaseAdapterProvider) => new TransactionalAdapter<LegalEntitiesDatabase>(databaseProvider),
        [LegalEntitiesDatabaseAdapterInstanceProvider],
      );

    // use cases
    container
      .addSingleton(CompleteProfile, [ProfileRepository])
      .addSingleton(CreateDraftAccount, [DraftAccountRepository])
      .addSingleton(CompleteDraftAccount, [DraftAccountRepository, IdGenerator, AccountRepository])
      .addSingleton(RemoveDraftAccount, [DraftAccountRepository])
      .addSingleton(TransformDraftAccountIntoRegularAccount, [
        DraftAccountRepository,
        InvestmentAccountsService,
        AccountRepository,
        'LegalEntitiesTransactionalAdapter',
        ProfileRepository,
      ]);
  }
}

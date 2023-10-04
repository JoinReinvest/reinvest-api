import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import {
  createRegistrationDatabaseAdapterProvider,
  RegistrationDatabase,
  RegistrationDatabaseAdapterInstanceProvider,
  RegistrationDatabaseAdapterProvider,
} from 'Registration/Adapter/Database/DatabaseAdapter';
import { BankAccountRepository } from 'Registration/Adapter/Database/Repository/BankAccountRepository';
import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { NorthCapitalDocumentsSynchronizationRepository } from 'Registration/Adapter/Database/Repository/NorthCapitalDocumentsSynchronizationRepository';
import { NorthCapitalSynchronizationRepository } from 'Registration/Adapter/Database/Repository/NorthCapitalSynchronizationRepository';
import { RegistryQueryRepository } from 'Registration/Adapter/Database/Repository/RegistryQueryRepository';
import { VertaloSynchronizationRepository } from 'Registration/Adapter/Database/Repository/VertaloSynchronizationRepository';
import { LegalEntitiesService } from 'Registration/Adapter/Modules/LegalEntitiesService';
import { RegistrationDocumentsService } from 'Registration/Adapter/Modules/RegistrationDocumentsService';
import { NorthCapitalAdapter } from 'Registration/Adapter/NorthCapital/NorthCapitalAdapter';
import { NorthCapitalSynchronizer } from 'Registration/Adapter/NorthCapital/NorthCapitalSynchronizer';
import { VertaloAdapter } from 'Registration/Adapter/Vertalo/VertaloAdapter';
import { VertaloSynchronizer } from 'Registration/Adapter/Vertalo/VertaloSynchronizer';
import { EmailCreator } from 'Registration/Domain/EmailCreator';
import { Registration } from 'Registration/index';
import { IdentityService } from "LegalEntities/Adapter/Modules/IdentityService";

export class AdapterServiceProvider {
  private config: Registration.Config;

  constructor(config: Registration.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator).addObjectFactory(EmailCreator, () => new EmailCreator(this.config.emailDomain), []);

    // db
    container
      .addAsValue(RegistrationDatabaseAdapterInstanceProvider, createRegistrationDatabaseAdapterProvider(this.config.database))
      .addSingleton(MappingRegistryRepository, [RegistrationDatabaseAdapterInstanceProvider, IdGenerator, EmailCreator])
      .addSingleton(NorthCapitalSynchronizationRepository, [RegistrationDatabaseAdapterInstanceProvider, IdGenerator])
      .addSingleton(NorthCapitalDocumentsSynchronizationRepository, [RegistrationDatabaseAdapterInstanceProvider, IdGenerator])
      .addSingleton(VertaloSynchronizationRepository, [RegistrationDatabaseAdapterInstanceProvider, IdGenerator])
      .addSingleton(RegistryQueryRepository, [RegistrationDatabaseAdapterInstanceProvider])
      .addSingleton(BankAccountRepository, [RegistrationDatabaseAdapterInstanceProvider]);

    container.addSingleton(IdentityService, ['Identity']);

    container.addObjectFactory(
      'RegistrationTransactionalAdapter',
      (databaseProvider: RegistrationDatabaseAdapterProvider) => new TransactionalAdapter<RegistrationDatabase>(databaseProvider),
      [RegistrationDatabaseAdapterInstanceProvider],
    );

    // modules
    container.addSingleton(LegalEntitiesService, ['LegalEntities']).addSingleton(RegistrationDocumentsService, ['Documents']);
    // north capital
    container
      .addAsValue('NorthCapitalConfig', this.config.northCapital)
      .addSingleton(NorthCapitalAdapter, ['NorthCapitalConfig'])
      .addSingleton(NorthCapitalSynchronizer, [
        NorthCapitalAdapter,
        NorthCapitalSynchronizationRepository,
        NorthCapitalDocumentsSynchronizationRepository,
        RegistrationDocumentsService,
      ]);

    // vertalo
    container
      .addAsValue('VertaloConfig', this.config.vertalo)
      .addSingleton(VertaloAdapter, ['VertaloConfig'])
      .addSingleton(VertaloSynchronizer, [VertaloAdapter, VertaloSynchronizationRepository]);
  }
}

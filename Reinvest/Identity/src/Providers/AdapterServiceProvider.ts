import { ContainerInterface } from 'Container/Container';
import { CognitoService } from 'Identity/Adapter/AWS/CognitoService';
import { SmsService } from 'Identity/Adapter/AWS/SmsService';
import { createIdentityDatabaseAdapterProvider, DatabaseAdapterProvider, IdentityDatabase } from 'Identity/Adapter/Database/IdentityDatabaseAdapter';
import { IncentiveTokenRepository } from 'Identity/Adapter/Database/Repository/IncentiveTokenRepository';
import { PhoneRepository } from 'Identity/Adapter/Database/Repository/PhoneRepository';
import { UserRepository } from 'Identity/Adapter/Database/Repository/UserRepository';
import { ProfileService } from 'Identity/Adapter/Profile/ProfileService';
import { Identity } from 'Identity/index';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { UniqueTokenGenerator } from 'IdGenerator/UniqueTokenGenerator';
import { DatabaseProvider } from 'PostgreSQL/DatabaseProvider';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';

export class AdapterServiceProvider {
  private config: Identity.Config;

  constructor(config: Identity.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator).addSingleton(UniqueTokenGenerator);

    container.addAsValue('SNSConfig', this.config.SNS).addAsValue('CognitoConfig', this.config.Cognito);

    container.addSingleton(SmsService, ['SNSConfig']).addSingleton(CognitoService, ['CognitoConfig']);

    // database
    container
      .addAsValue(DatabaseAdapterProvider, createIdentityDatabaseAdapterProvider(this.config.database))
      .addObjectFactory(
        TransactionalAdapter,
        (databaseProvider: DatabaseProvider<IdentityDatabase>) => new TransactionalAdapter<IdentityDatabase>(databaseProvider),
        [DatabaseAdapterProvider],
      )
      .addSingleton(PhoneRepository, [DatabaseAdapterProvider, TransactionalAdapter, SmsService, CognitoService])
      .addSingleton(IncentiveTokenRepository, [DatabaseAdapterProvider, UniqueTokenGenerator])
      .addSingleton(UserRepository, [DatabaseAdapterProvider]);
    container.addSingleton(ProfileService, ['InvestmentAccounts']);
  }
}

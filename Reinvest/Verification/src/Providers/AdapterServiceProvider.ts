import { ContainerInterface } from 'Container/Container';
import { createVerificationDatabaseAdapterProvider, VerificationDatabaseAdapterInstanceProvider } from 'Verification/Adapter/Database/DatabaseAdapter';
import { VerificationAdapter } from 'Verification/Adapter/Database/Repository/VerificationAdapter';
import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';
import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';
import { Verification } from 'Verification/index';

export class AdapterServiceProvider {
  private config: Verification.Config;

  constructor(config: Verification.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // db
    container
      .addAsValue(VerificationDatabaseAdapterInstanceProvider, createVerificationDatabaseAdapterProvider(this.config.database))
      .addSingleton(VerificationAdapter, [VerificationDatabaseAdapterInstanceProvider]);

    //modules
    container.addSingleton(RegistrationService, ['Registration']);

    // north capital
    container.addAsValue('NorthCapitalConfig', this.config.northCapital).addSingleton(VerificationNorthCapitalAdapter, ['NorthCapitalConfig']);
  }
}

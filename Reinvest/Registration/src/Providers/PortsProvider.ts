import { ContainerInterface } from 'Container/Container';
import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { NorthCapitalDocumentsSynchronizationRepository } from 'Registration/Adapter/Database/Repository/NorthCapitalDocumentsSynchronizationRepository';
import { RegistryQueryRepository } from 'Registration/Adapter/Database/Repository/RegistryQueryRepository';
import { NorthCapitalSynchronizer } from 'Registration/Adapter/NorthCapital/NorthCapitalSynchronizer';
import { Registration } from 'Registration/index';
import { BankAccountQuery } from 'Registration/IntegrationLogic/UseCase/BankAccount/BankAccountQuery';
import { FulfillBankAccount } from 'Registration/IntegrationLogic/UseCase/BankAccount/FulfillBankAccount';
import { InitializeBankAccount } from 'Registration/IntegrationLogic/UseCase/BankAccount/InitializeBankAccount';
import { UpdateBankAccount } from 'Registration/IntegrationLogic/UseCase/BankAccount/UpdateBankAccount';
import { ImmediateSynchronize } from 'Registration/IntegrationLogic/UseCase/ImmediateSynchronize';
import { SynchronizeBeneficiaryAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeBeneficiaryAccount';
import { SynchronizeCompany } from 'Registration/IntegrationLogic/UseCase/SynchronizeCompany';
import { SynchronizeCompanyAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeCompanyAccount';
import { SynchronizeIndividualAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeIndividualAccount';
import { SynchronizeProfile } from 'Registration/IntegrationLogic/UseCase/SynchronizeProfile';
import { SynchronizeRegistryRecords } from 'Registration/IntegrationLogic/UseCase/SynchronizeRegistryRecords';
import { SynchronizeStakeholder } from 'Registration/IntegrationLogic/UseCase/SynchronizeStakeholder';
import { BankAccountController } from 'Registration/Port/Api/BankAccountController';
import { NorthCapitalDocumentSynchronizationController } from 'Registration/Port/Api/NorthCapitalDocumentSynchronizationController';
import { NorthCapitalDocumentSynchronizationQuery } from 'Registration/Port/Api/NorthCapitalDocumentSynchronizationQuery';
import { RegistryQuery } from 'Registration/Port/Api/RegistryQuery';
import { SynchronizationController } from 'Registration/Port/Api/SynchronizationController';
import { SynchronizationQuery } from 'Registration/Port/Api/SynchronizationQuery';
import { BeneficiaryAccountOpenedEventHandler } from 'Registration/Port/Queue/EventHandler/BeneficiaryAccountOpenedEventHandler';
import { CompanyAccountOpenedEventHandler } from 'Registration/Port/Queue/EventHandler/CompanyAccountOpenedEventHandler';
import { IndividualAccountOpenedEventHandler } from 'Registration/Port/Queue/EventHandler/IndividualAccountOpenedEventHandler';
import { ProfileCompletedEventHandler } from 'Registration/Port/Queue/EventHandler/ProfileCompletedEventHandler';

export class PortsProvider {
  private config: Registration.Config;

  constructor(config: Registration.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container
      .addSingleton(SynchronizationQuery, [MappingRegistryRepository])
      .addSingleton(RegistryQuery, [RegistryQueryRepository])
      .addSingleton(ImmediateSynchronize, [
        MappingRegistryRepository,
        SynchronizeProfile,
        SynchronizeIndividualAccount,
        SynchronizeCompanyAccount,
        SynchronizeCompany,
        SynchronizeStakeholder,
        RegistryQuery,
        SynchronizeRegistryRecords,
      ])
      .addSingleton(SynchronizationController, [
        MappingRegistryRepository,
        SynchronizeProfile,
        SynchronizeIndividualAccount,
        SynchronizeCompanyAccount,
        SynchronizeCompany,
        SynchronizeStakeholder,
        ImmediateSynchronize,
        SynchronizeBeneficiaryAccount,
      ])
      .addSingleton(NorthCapitalDocumentSynchronizationQuery, [NorthCapitalDocumentsSynchronizationRepository])
      .addSingleton(NorthCapitalDocumentSynchronizationController, [NorthCapitalSynchronizer])
      .addSingleton(BankAccountController, [InitializeBankAccount, FulfillBankAccount, BankAccountQuery, UpdateBankAccount, ImmediateSynchronize]);

    // event handlers
    container
      .addSingleton(ProfileCompletedEventHandler, [MappingRegistryRepository, SynchronizeProfile])
      .addSingleton(IndividualAccountOpenedEventHandler, [MappingRegistryRepository, SynchronizeIndividualAccount])
      .addSingleton(BeneficiaryAccountOpenedEventHandler, [MappingRegistryRepository, SynchronizeBeneficiaryAccount])
      .addSingleton(CompanyAccountOpenedEventHandler, [MappingRegistryRepository, SynchronizeCompanyAccount, ImmediateSynchronize]);
  }
}

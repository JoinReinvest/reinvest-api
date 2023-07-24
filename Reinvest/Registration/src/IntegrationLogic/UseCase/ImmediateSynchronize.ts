import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { SynchronizeCompany } from 'Registration/IntegrationLogic/UseCase/SynchronizeCompany';
import { SynchronizeCompanyAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeCompanyAccount';
import { SynchronizeIndividualAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeIndividualAccount';
import { SynchronizeProfile } from 'Registration/IntegrationLogic/UseCase/SynchronizeProfile';
import { SynchronizeRegistryRecords } from 'Registration/IntegrationLogic/UseCase/SynchronizeRegistryRecords';
import { SynchronizeStakeholder } from 'Registration/IntegrationLogic/UseCase/SynchronizeStakeholder';
import { NorthCapitalAccountStructure, RegistryQuery } from 'Registration/Port/Api/RegistryQuery';

export class ImmediateSynchronize {
  private registryQuery: RegistryQuery;
  private mappingRegistryRepository: MappingRegistryRepository;
  private synchronizeProfileUseCase: SynchronizeProfile;
  private synchronizeIndividualAccountUseCase: SynchronizeIndividualAccount;
  private synchronizeCompanyAccountUseCase: SynchronizeCompanyAccount;
  private synchronizeCompanyUseCase: SynchronizeCompany;
  private synchronizeStakeholderUseCase: SynchronizeStakeholder;
  private synchronizeRegistryRecords: SynchronizeRegistryRecords;

  constructor(
    mappingRegistryRepository: MappingRegistryRepository,
    synchronizeProfileUseCase: SynchronizeProfile,
    synchronizeIndividualAccountUseCase: SynchronizeIndividualAccount,
    synchronizeCompanyAccountUseCase: SynchronizeCompanyAccount,
    synchronizeCompanyUseCase: SynchronizeCompany,
    synchronizeStakeholderUseCase: SynchronizeStakeholder,
    registryQuery: RegistryQuery,
    synchronizeRegistryRecords: SynchronizeRegistryRecords,
  ) {
    this.mappingRegistryRepository = mappingRegistryRepository;
    this.synchronizeProfileUseCase = synchronizeProfileUseCase;
    this.synchronizeIndividualAccountUseCase = synchronizeIndividualAccountUseCase;
    this.synchronizeCompanyAccountUseCase = synchronizeCompanyAccountUseCase;
    this.synchronizeCompanyUseCase = synchronizeCompanyUseCase;
    this.synchronizeStakeholderUseCase = synchronizeStakeholderUseCase;
    this.registryQuery = registryQuery;
    this.synchronizeRegistryRecords = synchronizeRegistryRecords;
  }

  public static getClassName = (): string => 'ImmediateSynchronize';

  public async immediatelySynchronizeAccount(profileId: string, accountId: string): Promise<boolean> {
    await this.synchronizeRegistryRecords.execute(profileId);
    const accountStructure = await this.registryQuery.getAccountStructureForSynchronization(profileId, accountId);

    if (!accountStructure) {
      return false;
    }

    const { type, account } = accountStructure;
    let status = await this.syncProfile(accountStructure);

    if (type === 'INDIVIDUAL') {
      status = status && (await this.synchronizeIndividualAccount(accountStructure));
    }

    if (type === 'COMPANY' && !account.syncStatus) {
      const record = await this.mappingRegistryRepository.getRecordById(account.recordId);
      status = status && (await this.synchronizeCompanyAccountUseCase.execute(record));
    }

    return status;
  }

  public async immediatelySynchronizeAllAccountStructure(profileId: string, accountId: string): Promise<boolean> {
    await this.synchronizeRegistryRecords.execute(profileId);
    const accountStructure = await this.registryQuery.getAccountStructureForSynchronization(profileId, accountId);

    if (!accountStructure) {
      return false;
    }

    const { type } = accountStructure;
    let status = await this.syncProfile(accountStructure);

    if (type === 'INDIVIDUAL') {
      status = status && (await this.synchronizeIndividualAccount(accountStructure));
    }

    if (type === 'COMPANY') {
      status = status && (await this.synchronizeCompanyAccount(accountStructure));
    }

    return status;
  }

  private async syncProfile(accountStructure: NorthCapitalAccountStructure): Promise<boolean> {
    const { profile } = accountStructure;

    if (!profile.syncStatus) {
      const record = await this.mappingRegistryRepository.getRecordById(profile.recordId);

      return this.synchronizeProfileUseCase.execute(record);
    }

    return true;
  }

  private async synchronizeIndividualAccount(accountStructure: NorthCapitalAccountStructure): Promise<boolean> {
    const { account } = accountStructure;

    if (!account.syncStatus) {
      const record = await this.mappingRegistryRepository.getRecordById(account.recordId);

      return this.synchronizeIndividualAccountUseCase.execute(record);
    }

    return true;
  }

  private async synchronizeCompanyAccount(accountStructure: NorthCapitalAccountStructure): Promise<boolean> {
    const { account } = accountStructure;
    let status = true;

    if (!account.syncStatus) {
      const record = await this.mappingRegistryRepository.getRecordById(account.recordId);
      status = status && (await this.synchronizeCompanyAccountUseCase.execute(record));
    }

    if (accountStructure.company && !accountStructure.company.syncStatus) {
      const record = await this.mappingRegistryRepository.getRecordById(accountStructure.company.recordId);
      status = status && (await this.synchronizeCompanyUseCase.execute(record));
    }

    if (accountStructure.stakeholders) {
      const { stakeholders } = accountStructure;

      for (const stakeholder of stakeholders) {
        if (stakeholder.syncStatus) {
          continue;
        }

        const record = await this.mappingRegistryRepository.getRecordById(stakeholder.recordId);
        status = status && (await this.synchronizeStakeholderUseCase.execute(record));
      }
    }

    return status;
  }
}

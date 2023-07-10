import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { MappedType } from 'Registration/Domain/Model/Mapping/MappedType';
import { ImmediateSynchronize } from 'Registration/IntegrationLogic/UseCase/ImmediateSynchronize';
import { SynchronizeBeneficiaryAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeBeneficiaryAccount';
import { SynchronizeCompany } from 'Registration/IntegrationLogic/UseCase/SynchronizeCompany';
import { SynchronizeCompanyAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeCompanyAccount';
import { SynchronizeIndividualAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeIndividualAccount';
import { SynchronizeProfile } from 'Registration/IntegrationLogic/UseCase/SynchronizeProfile';
import { SynchronizeStakeholder } from 'Registration/IntegrationLogic/UseCase/SynchronizeStakeholder';

export class SynchronizationController {
  private mappingRegistryRepository: MappingRegistryRepository;
  private synchronizeProfileUseCase: SynchronizeProfile;
  private synchronizeIndividualAccountUseCase: SynchronizeIndividualAccount;
  private synchronizeCompanyAccountUseCase: SynchronizeCompanyAccount;
  private synchronizeCompanyUseCase: SynchronizeCompany;
  private synchronizeStakeholderUseCase: SynchronizeStakeholder;
  private immediateSynchronizeUseCase: ImmediateSynchronize;
  private synchronizeBeneficiaryUseCase: SynchronizeBeneficiaryAccount;

  constructor(
    mappingRegistryRepository: MappingRegistryRepository,
    synchronizeProfileUseCase: SynchronizeProfile,
    synchronizeIndividualAccountUseCase: SynchronizeIndividualAccount,
    synchronizeCompanyAccountUseCase: SynchronizeCompanyAccount,
    synchronizeCompanyUseCase: SynchronizeCompany,
    synchronizeStakeholderUseCase: SynchronizeStakeholder,
    immediateSynchronizeUseCase: ImmediateSynchronize,
    synchronizeBeneficiaryUseCase: SynchronizeBeneficiaryAccount,
  ) {
    this.synchronizeProfileUseCase = synchronizeProfileUseCase;
    this.synchronizeIndividualAccountUseCase = synchronizeIndividualAccountUseCase;
    this.synchronizeCompanyAccountUseCase = synchronizeCompanyAccountUseCase;
    this.mappingRegistryRepository = mappingRegistryRepository;
    this.synchronizeCompanyUseCase = synchronizeCompanyUseCase;
    this.synchronizeStakeholderUseCase = synchronizeStakeholderUseCase;
    this.immediateSynchronizeUseCase = immediateSynchronizeUseCase;
    this.synchronizeBeneficiaryUseCase = synchronizeBeneficiaryUseCase;
  }

  public static getClassName = (): string => 'SynchronizationController';

  public async synchronize(recordId: string): Promise<boolean> {
    const record = await this.mappingRegistryRepository.getRecordById(recordId);
    console.log({ recordToSync: record });
    // levels of synchronization? ie. do not synchronize stakeholder/company
    // if company was not synchronized or do not synchronize account if profile not synchronized
    switch (record.getMappedType()) {
      case MappedType.COMPANY:
        return await this.synchronizeCompanyUseCase.execute(record);
      case MappedType.STAKEHOLDER:
        return await this.synchronizeStakeholderUseCase.execute(record);
      case MappedType.PROFILE:
        return await this.synchronizeProfileUseCase.execute(record);
      case MappedType.INDIVIDUAL_ACCOUNT:
        return await this.synchronizeIndividualAccountUseCase.execute(record);
      case MappedType.CORPORATE_ACCOUNT:
      case MappedType.TRUST_ACCOUNT:
        return await this.synchronizeCompanyAccountUseCase.execute(record);
      case MappedType.BENEFICIARY_ACCOUNT:
        return await this.synchronizeBeneficiaryUseCase.execute(record);
      default:
        console.error(`[FAILED] Record type not implemented, recordId: ${record.getRecordId()}`);

        return false;
    }
  }

  public async synchronizeProfile(profileId: string): Promise<boolean> {
    const record = await this.mappingRegistryRepository.findByProfile(profileId);
    console.log({ recordToSync: record });

    return await this.synchronizeProfileUseCase.execute(record);
  }

  public async synchronizeCompany(profileId: string, accountId: string): Promise<boolean> {
    const record = await this.mappingRegistryRepository.getCompanyById(profileId, accountId);
    console.log({ recordToSync: record });

    return await this.synchronizeCompanyUseCase.execute(record);
  }

  public async synchronizeStakeholder(profileId: string, accountId: string, stakeholderId: string): Promise<boolean> {
    const record = await this.mappingRegistryRepository.getStakeholderById(profileId, accountId, stakeholderId);
    console.log({ recordToSync: record });

    return await this.synchronizeCompanyUseCase.execute(record);
  }

  public async resynchronizeCompanyAccount(profileId: string, accountId: string): Promise<boolean> {
    const record = await this.mappingRegistryRepository.getCompanyAccountRecordByProfileAndExternalId(profileId, accountId);

    if (!record) {
      return false;
    }

    await this.synchronizeCompanyAccountUseCase.execute(record);
    await this.mappingRegistryRepository.setCompanyAndStakeholdersAsDirty(profileId, accountId);

    return this.immediateSynchronizeUseCase.immediatelySynchronizeAllAccountStructure(profileId, accountId);
  }

  public async resynchronizeIndividualAccount(profileId: string): Promise<boolean> {
    const record = await this.mappingRegistryRepository.getIndividualAccountRecordByProfile(profileId);

    if (!record) {
      return false;
    }

    return this.synchronizeIndividualAccountUseCase.execute(record);
  }

  public async immediatelySynchronizeAccount(profileId: string, accountId: string): Promise<boolean> {
    return this.immediateSynchronizeUseCase.immediatelySynchronizeAccount(profileId, accountId);
  }

  public async immediatelySynchronizeAllAccountStructure(profileId: string, accountId: string): Promise<boolean> {
    return this.immediateSynchronizeUseCase.immediatelySynchronizeAllAccountStructure(profileId, accountId);
  }
}

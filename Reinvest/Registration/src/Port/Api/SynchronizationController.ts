import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { MappedType } from 'Registration/Domain/Model/Mapping/MappedType';
import { SynchronizeCompany } from 'Registration/IntegrationLogic/UseCase/SynchronizeCompany';
import { SynchronizeCompanyAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeCompanyAccount';
import { SynchronizeIndividualAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeIndividualAccount';
import { SynchronizeProfile } from 'Registration/IntegrationLogic/UseCase/SynchronizeProfile';
import { SynchronizeStakeholder } from 'Registration/IntegrationLogic/UseCase/SynchronizeStakeholder';

export class SynchronizationController {
  public static getClassName = (): string => 'SynchronizationController';
  private mappingRegistryRepository: MappingRegistryRepository;
  private synchronizeProfileUseCase: SynchronizeProfile;
  private synchronizeIndividualAccountUseCase: SynchronizeIndividualAccount;
  private synchronizeCompanyAccountUseCase: SynchronizeCompanyAccount;
  private synchronizeCompanyUseCase: SynchronizeCompany;
  private synchronizeStakeholderUseCase: SynchronizeStakeholder;

  constructor(
    mappingRegistryRepository: MappingRegistryRepository,
    synchronizeProfileUseCase: SynchronizeProfile,
    synchronizeIndividualAccountUseCase: SynchronizeIndividualAccount,
    synchronizeCompanyAccountUseCase: SynchronizeCompanyAccount,
    synchronizeCompanyUseCase: SynchronizeCompany,
    synchronizeStakeholderUseCase: SynchronizeStakeholder,
  ) {
    this.synchronizeProfileUseCase = synchronizeProfileUseCase;
    this.synchronizeIndividualAccountUseCase = synchronizeIndividualAccountUseCase;
    this.synchronizeCompanyAccountUseCase = synchronizeCompanyAccountUseCase;
    this.mappingRegistryRepository = mappingRegistryRepository;
    this.synchronizeCompanyUseCase = synchronizeCompanyUseCase;
    this.synchronizeStakeholderUseCase = synchronizeStakeholderUseCase;
  }

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
      default:
        console.error(`[FAILED] Record type not implemented, recordId: ${record.getRecordId()}`);

        return false;
    }
  }
  public async synchronizeProfile(profileId: string): Promise<boolean> {
    const record = await this.mappingRegistryRepository.getRecordById(profileId);
    console.log({ recordToSync: record });

    return await this.synchronizeProfileUseCase.execute(record);
  }

  public async synchronizeCompany(profileId: string, accountId: string): Promise<boolean> {
    const record = await this.mappingRegistryRepository.getCompanyById(accountId, profileId);
    console.log({ recordToSync: record });

    return await this.synchronizeCompanyAccountUseCase.execute(record);
  }
}

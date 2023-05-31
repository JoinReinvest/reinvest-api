import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { LegalEntitiesService } from 'Registration/Adapter/Modules/LegalEntitiesService';
import { VertaloSynchronizer } from 'Registration/Adapter/Vertalo/VertaloSynchronizer';
import { BeneficiaryAccountForSynchronization } from 'Registration/Domain/Model/Account';
import { MappedRecord } from 'Registration/Domain/Model/Mapping/MappedRecord';
import { VertaloMapper } from 'Registration/Domain/VendorModel/Vertalo/VertaloMapper';
import { AbstractSynchronize } from 'Registration/IntegrationLogic/UseCase/AbstractSynchronize';

export class SynchronizeBeneficiaryAccount extends AbstractSynchronize {
  private legalEntitiesService: LegalEntitiesService;
  private vertaloSynchronizer: VertaloSynchronizer;

  constructor(mappingRegistryRepository: MappingRegistryRepository, legalEntitiesService: LegalEntitiesService, vertaloSynchronizer: VertaloSynchronizer) {
    super(mappingRegistryRepository);
    this.legalEntitiesService = legalEntitiesService;
    this.vertaloSynchronizer = vertaloSynchronizer;
  }

  static getClassName = () => 'SynchronizeBeneficiaryAccount';

  async execute(record: MappedRecord): Promise<boolean> {
    if (!record.isBeneficiaryAccount() || !(await this.lockExecution(record))) {
      return false;
    }

    try {
      console.log(`[START] Beneficiary account synchronization, recordId: ${record.getRecordId()}`);
      const beneficiaryAccount = await this.legalEntitiesService.getBeneficiaryAccount(record.getProfileId(), record.getExternalId());
      const vertaloStatus = await this.synchronizeVertalo(record, beneficiaryAccount);

      if (vertaloStatus) {
        await this.setCleanAndUnlockExecution(record);
        console.log(`[SUCCESS] Beneficiary account synchronized, recordId: ${record.getRecordId()}`);

        return true;
      } else {
        console.error(`[FAILED] Beneficiary account synchronization FAILED, recordId: ${record.getRecordId()}`);
        await this.unlockExecution(record);
      }
    } catch (error: any) {
      console.error(`[FAILED] Beneficiary account synchronization FAILED with error, recordId: ${record.getRecordId()}`, error);
      await this.unlockExecution(record);
    }

    return false;
  }

  private async synchronizeVertalo(record: MappedRecord, beneficiaryAccount: BeneficiaryAccountForSynchronization): Promise<boolean> {
    try {
      const vertaloBeneficiaryAccount = VertaloMapper.mapBeneficiaryAccount(beneficiaryAccount, record.getEmail());
      await this.vertaloSynchronizer.synchronizeAccount(record.getRecordId(), vertaloBeneficiaryAccount);

      console.log(`[Vertalo SUCCESS] Beneficiary account synchronized, recordId: ${record.getRecordId()}`);

      return true;
    } catch (error: any) {
      console.error(`[Vertalo FAILED] Vertalo Beneficiary account synchronization FAILED, recordId: ${record.getRecordId()}`, error);

      return false;
    }
  }
}

import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { LegalEntitiesService } from 'Registration/Adapter/Modules/LegalEntitiesService';
import { VertaloSynchronizer } from 'Registration/Adapter/Vertalo/VertaloSynchronizer';
import { IndividualAccountForSynchronization } from 'Registration/Domain/Model/Account';
import { MappedRecord } from 'Registration/Domain/Model/Mapping/MappedRecord';
import { NorthCapitalMapper } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalMapper';
import { VertaloMapper } from 'Registration/Domain/VendorModel/Vertalo/VertaloMapper';
import { AbstractSynchronize } from 'Registration/IntegrationLogic/UseCase/AbstractSynchronize';

import { NorthCapitalSynchronizer } from '../../Adapter/NorthCapital/NorthCapitalSynchronizer';

export class SynchronizeIndividualAccount extends AbstractSynchronize {
  private legalEntitiesService: LegalEntitiesService;
  private northCapitalSynchronizer: NorthCapitalSynchronizer;
  private vertaloSynchronizer: VertaloSynchronizer;

  constructor(
    mappingRegistryRepository: MappingRegistryRepository,
    legalEntitiesService: LegalEntitiesService,
    northCapitalSynchronizer: NorthCapitalSynchronizer,
    vertaloSynchronizer: VertaloSynchronizer,
  ) {
    super(mappingRegistryRepository);
    this.legalEntitiesService = legalEntitiesService;
    this.northCapitalSynchronizer = northCapitalSynchronizer;
    this.vertaloSynchronizer = vertaloSynchronizer;
  }

  static getClassName = () => 'SynchronizeIndividualAccount';

  async execute(record: MappedRecord): Promise<boolean> {
    if (!record.isIndividualAccount() || !(await this.lockExecution(record))) {
      return false;
    }

    try {
      console.log(`[START] Individual account synchronization, recordId: ${record.getRecordId()}`);
      const individualAccount = await this.legalEntitiesService.getIndividualAccount(record.getProfileId(), record.getExternalId());

      const northCapitalStatus = await this.synchronizeNorthCapital(record, individualAccount);
      const vertaloStatus = await this.synchronizeVertalo(record, individualAccount);

      if (northCapitalStatus && vertaloStatus) {
        await this.setCleanAndUnlockExecution(record);
        console.log(`[SUCCESS] Individual account synchronized, recordId: ${record.getRecordId()}`);

        return true;
      } else {
        console.error(`[FAILED] Individual account synchronization FAILED, recordId: ${record.getRecordId()}`);
        await this.unlockExecution(record);
      }
    } catch (error: any) {
      console.error(`[FAILED] Individual account synchronization FAILED with error, recordId: ${record.getRecordId()}`, error);
      await this.unlockExecution(record);
    }

    return false;
  }

  private async synchronizeNorthCapital(record: MappedRecord, individualAccount: IndividualAccountForSynchronization): Promise<boolean> {
    try {
      const northCapitalIndividualAccount = NorthCapitalMapper.mapIndividualAccount(individualAccount);
      await this.northCapitalSynchronizer.synchronizeIndividualAccount(record.getRecordId(), northCapitalIndividualAccount);
      await this.northCapitalSynchronizer.synchronizeLinks(record.getRecordId(), northCapitalIndividualAccount.getLinksConfiguration());

      console.log(`[North Capital SUCCESS] Individual account synchronized, recordId: ${record.getRecordId()}`);

      return true;
    } catch (error: any) {
      console.error(`[North Capital FAILED] North Capital Individual account synchronization FAILED, recordId: ${record.getRecordId()}`, error);

      return false;
    }
  }

  private async synchronizeVertalo(record: MappedRecord, individualAccount: IndividualAccountForSynchronization): Promise<boolean> {
    try {
      const vertaloIndividualAccount = VertaloMapper.mapIndividualAccount(individualAccount, record.getEmail());
      await this.vertaloSynchronizer.synchronizeAccount(record.getRecordId(), vertaloIndividualAccount);

      console.log(`[Vertalo SUCCESS] Individual account synchronized, recordId: ${record.getRecordId()}`);

      return true;
    } catch (error: any) {
      console.error(`[Vertalo FAILED] Vertalo Individual account synchronization FAILED, recordId: ${record.getRecordId()}`, error);

      return false;
    }
  }
}

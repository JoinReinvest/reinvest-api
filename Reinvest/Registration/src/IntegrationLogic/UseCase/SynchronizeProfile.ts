import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { LegalEntitiesService } from 'Registration/Adapter/Modules/LegalEntitiesService';
import { MappedRecord } from 'Registration/Domain/Model/Mapping/MappedRecord';
import { NorthCapitalMapper } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalMapper';
import { AbstractSynchronize } from 'Registration/IntegrationLogic/UseCase/AbstractSynchronize';

import { NorthCapitalSynchronizer } from '../../Adapter/NorthCapital/NorthCapitalSynchronizer';

export class SynchronizeProfile extends AbstractSynchronize {
  static getClassName = () => 'SynchronizeProfile';
  private legalEntitiesService: LegalEntitiesService;
  private northCapitalSynchronizer: NorthCapitalSynchronizer;

  constructor(
    mappingRegistryRepository: MappingRegistryRepository,
    legalEntitiesService: LegalEntitiesService,
    northCapitalSynchronizer: NorthCapitalSynchronizer,
  ) {
    super(mappingRegistryRepository);
    this.legalEntitiesService = legalEntitiesService;
    this.northCapitalSynchronizer = northCapitalSynchronizer;
  }

  async execute(record: MappedRecord): Promise<void> {
    if (!record.isProfile() || !(await this.lockExecution(record))) {
      return;
    }

    try {
      console.log(`[START] Profile synchronization, recordId: ${record.getRecordId()}`);
      const profile = await this.legalEntitiesService.getProfile(record.getProfileId());

      const northCapitalMainParty = NorthCapitalMapper.mapProfile(profile, record.getEmail());
      await this.northCapitalSynchronizer.synchronizeMainParty(record.getRecordId(), northCapitalMainParty);

      await this.setCleanAndUnlockExecution(record);
      console.log(`[FINISHED] Profile synchronization, recordId: ${record.getRecordId()}`);
    } catch (error: any) {
      console.error(`[FAILED] Profile synchronization, recordId: ${record.getRecordId()}: ${error.message}`);
      await this.unlockExecution(record);
    }
  }
}

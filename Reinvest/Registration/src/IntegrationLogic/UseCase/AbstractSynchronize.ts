import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { MappedRecord } from 'Registration/Domain/Model/Mapping/MappedRecord';

export abstract class AbstractSynchronize {
  protected mappingRegistryRepository: MappingRegistryRepository;

  protected constructor(mappingRegistryRepository: MappingRegistryRepository) {
    this.mappingRegistryRepository = mappingRegistryRepository;
  }

  protected async lockExecution(record: MappedRecord): Promise<boolean> {
    if (!(await this.mappingRegistryRepository.lockRecord(record))) {
      console.warn(`Record ${record.getRecordId()} is locked`);

      return false;
    }

    return true;
  }

  protected async setCleanAndUnlockExecution(record: MappedRecord): Promise<boolean> {
    if (!(await this.mappingRegistryRepository.setClean(record))) {
      console.warn(`Failed to set clean: ${record.getRecordId()}`);

      return false;
    }

    return true;
  }

  protected async unlockExecution(record: MappedRecord): Promise<boolean> {
    if (!(await this.mappingRegistryRepository.unlockRecord(record))) {
      console.warn(`Failed to unlock record: ${record.getRecordId()}`);

      return false;
    }

    return true;
  }
}

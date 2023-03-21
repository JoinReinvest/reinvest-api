import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";
import {MappedRecord} from "Registration/Domain/Model/Mapping/MappedRecord";

export abstract class AbstractSynchronize {
    protected mappingRegistryRepository: MappingRegistryRepository;

    protected constructor(mappingRegistryRepository: MappingRegistryRepository) {
        this.mappingRegistryRepository = mappingRegistryRepository;
    }

    protected async lockExecution(record: MappedRecord): Promise<boolean> {
        if (!await this.mappingRegistryRepository.lockRecord(record)) {
            console.log(`Record ${record.getRecordId()} is locked1`);
            return false;
        }
        console.log(`Record ${record.getRecordId()} is locked2`);
        return true;
    }

    protected async unlockExecution(record: MappedRecord): Promise<boolean> {
        if (!await this.mappingRegistryRepository.setClean(record)) {
            console.log('Failed to set clean');
            return false;
        }

        return true;
    }

}
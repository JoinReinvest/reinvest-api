import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";

export class SynchronizationController {
    public static getClassName = (): string => "SynchronizationController";
    private mappingRegistryRepository: MappingRegistryRepository;

    constructor(mappingRegistryRepository: MappingRegistryRepository) {
        this.mappingRegistryRepository = mappingRegistryRepository;
    }

    public async synchronize(recordId: string): Promise<boolean> {
        const record = await this.mappingRegistryRepository.getRecordById(recordId);
        console.log({recordToSync: record});
        // levels of synchronization?
        // mapping record to use case
        // add synchronization for company and stakholder

        return true;
    }
}

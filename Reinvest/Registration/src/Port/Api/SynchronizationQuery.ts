import {
    NorthCapitalDocumentsSynchronizationRepository
} from "Registration/Adapter/Database/Repository/NorthCapitalDocumentsSynchronizationRepository";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";

export class SynchronizationQuery {
    public static getClassName = (): string => "SynchronizationQuery";
    private mappingRegistryRepository: MappingRegistryRepository;

    constructor(mappingRegistryRepository: MappingRegistryRepository) {
        this.mappingRegistryRepository = mappingRegistryRepository;
    }

    public async listObjectsToSync(): Promise<string[]> {
        const objectIds = await this.mappingRegistryRepository.listObjectsToSync();

        return objectIds ?? [];
    }
}

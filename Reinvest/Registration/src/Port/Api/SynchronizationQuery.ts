import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';

export class SynchronizationQuery {
  private mappingRegistryRepository: MappingRegistryRepository;

  constructor(mappingRegistryRepository: MappingRegistryRepository) {
    this.mappingRegistryRepository = mappingRegistryRepository;
  }

  public static getClassName = (): string => 'SynchronizationQuery';

  public async listObjectsToSync(): Promise<string[]> {
    const objectIds = await this.mappingRegistryRepository.listObjectsToSync();

    return objectIds ?? [];
  }
}

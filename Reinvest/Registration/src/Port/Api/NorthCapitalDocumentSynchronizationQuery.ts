import { NorthCapitalDocumentsSynchronizationRepository } from 'Registration/Adapter/Database/Repository/NorthCapitalDocumentsSynchronizationRepository';

export class NorthCapitalDocumentSynchronizationQuery {
  private northCapitalDocumentsSynchronizationRepository: NorthCapitalDocumentsSynchronizationRepository;

  constructor(northCapitalDocumentsSynchronizationRepository: NorthCapitalDocumentsSynchronizationRepository) {
    this.northCapitalDocumentsSynchronizationRepository = northCapitalDocumentsSynchronizationRepository;
  }

  public static getClassName = (): string => 'NorthCapitalDocumentSynchronizationQuery';

  public async listDocumentsToSynchronize(): Promise<string[]> {
    const documentIds = await this.northCapitalDocumentsSynchronizationRepository.getDocumentIdsToSync();

    return documentIds ?? [];
  }
}

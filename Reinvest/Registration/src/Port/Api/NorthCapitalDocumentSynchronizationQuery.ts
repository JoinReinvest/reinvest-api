import { NorthCapitalDocumentsSynchronizationRepository } from 'Registration/Adapter/Database/Repository/NorthCapitalDocumentsSynchronizationRepository';

export class NorthCapitalDocumentSynchronizationQuery {
  public static getClassName = (): string => 'NorthCapitalDocumentSynchronizationQuery';
  private northCapitalDocumentsSynchronizationRepository: NorthCapitalDocumentsSynchronizationRepository;

  constructor(northCapitalDocumentsSynchronizationRepository: NorthCapitalDocumentsSynchronizationRepository) {
    this.northCapitalDocumentsSynchronizationRepository = northCapitalDocumentsSynchronizationRepository;
  }

  public async listDocumentsToSynchronize(): Promise<string[]> {
    const documentIds = await this.northCapitalDocumentsSynchronizationRepository.getDocumentIdsToSync();

    return documentIds ?? [];
  }
}

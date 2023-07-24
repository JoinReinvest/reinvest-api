import { NorthCapitalSynchronizer } from 'Registration/Adapter/NorthCapital/NorthCapitalSynchronizer';

export class NorthCapitalDocumentSynchronizationController {
  public static getClassName = (): string => 'NorthCapitalDocumentSynchronizationController';
  private northCapitalSynchronizer: NorthCapitalSynchronizer;

  constructor(northCapitalSynchronizer: NorthCapitalSynchronizer) {
    this.northCapitalSynchronizer = northCapitalSynchronizer;
  }

  public async synchronizeDocument(documentId: string): Promise<boolean> {
    try {
      return await this.northCapitalSynchronizer.synchronizeDocument(documentId);
    } catch (error: any) {
      console.error(error);

      return false;
    }
  }
}

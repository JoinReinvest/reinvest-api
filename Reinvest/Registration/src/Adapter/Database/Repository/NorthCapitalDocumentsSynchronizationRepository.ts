import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DateTime } from 'Money/DateTime';
import { northCapitalDocumentsSynchronizationTable, RegistrationDatabaseAdapterProvider } from 'Registration/Adapter/Database/DatabaseAdapter';
import { InsertableNorthCapitalDocumentsSynchronization } from 'Registration/Adapter/Database/RegistrationSchema';
import { DocumentSchema } from 'Registration/Domain/Model/ReinvestTypes';
import { DocumentSyncState, NorthCapitalDocumentToSync, NorthCapitalObjectType } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes';

export class NorthCapitalDocumentsSynchronizationRepository {
  public static getClassName = (): string => 'NorthCapitalDocumentsSynchronizationRepository';
  private databaseAdapterProvider: RegistrationDatabaseAdapterProvider;

  private idGenerator: IdGeneratorInterface;

  constructor(databaseAdapterProvider: RegistrationDatabaseAdapterProvider, uniqueGenerator: IdGeneratorInterface) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.idGenerator = uniqueGenerator;
  }

  async addDocuments(recordId: string, northCapitalId: string, northCapitalType: NorthCapitalObjectType, documents: DocumentSchema[]): Promise<void> {
    const values = documents.map(
      (document: DocumentSchema) =>
        <InsertableNorthCapitalDocumentsSynchronization>{
          recordId,
          northCapitalId,
          northCapitalType,
          documentId: document.id,
          documentPath: document.path,
          documentFilename: document.fileName,
          version: 0,
          state: DocumentSyncState.DIRTY,
          createdDate: DateTime.now().toDate(),
          updatedDate: DateTime.now().toDate(),
        },
    );

    await this.databaseAdapterProvider
      .provide()
      .insertInto(northCapitalDocumentsSynchronizationTable)
      .values(values)
      .onConflict(oc => oc.columns(['documentId']).doNothing())
      .execute();
  }

  async getDocumentIdsToSync(): Promise<string[]> {
    try {
      const data = await this.databaseAdapterProvider
        .provide()
        .selectFrom(northCapitalDocumentsSynchronizationTable)
        .select(['documentId'])
        .where('state', '=', DocumentSyncState.DIRTY)
        .orWhere('state', '=', DocumentSyncState.TO_BE_DELETED)
        .orderBy('updatedDate', 'asc')
        .limit(20)
        .execute();

      return data.map((row: any) => row.documentId);
    } catch (error: any) {
      console.log(error.message);

      return [];
    }
  }

  async getDocumentToSync(documentId: string): Promise<NorthCapitalDocumentToSync | null> {
    try {
      return await this.databaseAdapterProvider
        .provide()
        .selectFrom(northCapitalDocumentsSynchronizationTable)
        .select([
          'recordId',
          'northCapitalId',
          'northCapitalType',
          'documentId',
          'documentPath',
          'documentFilename',
          'version',
          'state',
          'createdDate',
          'updatedDate',
        ])
        .where('documentId', '=', documentId)
        .limit(1)
        .castTo<NorthCapitalDocumentToSync>()
        .executeTakeFirstOrThrow();
    } catch (error: any) {
      console.error(error);

      return null;
    }
  }

  async setClean(document: NorthCapitalDocumentToSync): Promise<boolean> {
    const updatedDate = DateTime.now().toDate();
    const currentVersion = document.version;

    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(northCapitalDocumentsSynchronizationTable)
        .set({
          state: DocumentSyncState.CLEAN,
          version: currentVersion + 1,
          updatedDate,
        })
        .where('documentId', '=', document.documentId)
        .where('version', '=', currentVersion)
        .returning(['version'])
        .executeTakeFirstOrThrow();

      return true;
    } catch (error: any) {
      console.error('Failed to set document as clean - probably race conditioning', error);

      return false;
    }
  }

  async setFailed(document: NorthCapitalDocumentToSync): Promise<void> {
    const updatedDate = DateTime.now().toDate();
    const currentVersion = document.version;

    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(northCapitalDocumentsSynchronizationTable)
        .set({
          state: DocumentSyncState.FAILED,
          version: currentVersion + 1,
          updatedDate,
        })
        .where('documentId', '=', document.documentId)
        .where('version', '=', currentVersion)
        .returning(['version'])
        .executeTakeFirstOrThrow();
    } catch (error: any) {
      console.error('Failed to set document as failed - probably race conditioning', error);
    }
  }

  async moveToTheEndOfQueue(document: NorthCapitalDocumentToSync): Promise<void> {
    const updatedDate = DateTime.now().toDate();
    const currentVersion = document.version;

    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(northCapitalDocumentsSynchronizationTable)
        .set({
          updatedDate,
          version: currentVersion + 1,
        })
        .where('documentId', '=', document.documentId)
        .where('version', '=', currentVersion)
        .returning(['version'])
        .executeTakeFirstOrThrow();
    } catch (error: any) {
      console.error('Failed to set document move to the end of queue - probably race conditioning', error);
    }
  }
}

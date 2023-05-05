import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { RegistrationDatabaseAdapterProvider } from 'Registration/Adapter/Database/DatabaseAdapter';
import { BankAccount } from 'Registration/Domain/Model/BankAccount';

export class BankAccountRepository {
  private databaseAdapterProvider: RegistrationDatabaseAdapterProvider;
  private idGenerator: IdGeneratorInterface;

  constructor(databaseAdapterProvider: RegistrationDatabaseAdapterProvider, uniqueGenerator: IdGeneratorInterface) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.idGenerator = uniqueGenerator;
  }

  public static getClassName = (): string => 'BankAccountRepository';

  async findActiveBankAccount(profileId: string, accountId: string): Promise<void> {
    // try {
    //   const data = await this.databaseAdapterProvider
    //     .provide()
    //     .selectFrom(vertaloSynchronizationTable)
    //     .select(['recordId', 'vertaloIds', 'type', 'crc', 'documents', 'version'])
    //     .where('recordId', '=', recordId)
    //     .limit(1)
    //     .castTo<SelectableVertaloSynchronizationRecord>()
    //     .castTo<VertaloSynchronizationRecordType>()
    //     .executeTakeFirstOrThrow();
    //
    //   return VertaloSynchronizationRecord.create(data);
    // } catch (error: any) {
    //   return null;
    // }
  }

  async createSynchronizationRecord(bankAccount: BankAccount): Promise<void> {
    // await this.databaseAdapterProvider
    //   .provide()
    //   .insertInto(vertaloSynchronizationTable)
    //   .values(<InsertableVertaloSynchronization>{
    //     recordId,
    //     vertaloIds: JSON.stringify(vertaloIds),
    //     crc,
    //     type: entityType,
    //     documents: JSON.stringify([]),
    //     version: 0,
    //   })
    //   .onConflict(oc => oc.columns(['recordId']).doNothing())
    //   .execute();
  }

  async updateBankAccount(bankAccount: BankAccount): Promise<void> {
    // if (!synchronizationRecord.wasUpdated()) {
    //   return;
    // }
    //
    // const updatedDate = new Date();
    // const nextVersion = synchronizationRecord.getNextVersion();
    // const currentVersion = synchronizationRecord.getVersion();
    //
    // try {
    //   await this.databaseAdapterProvider
    //     .provide()
    //     .updateTable(vertaloSynchronizationTable)
    //     .set({
    //       version: nextVersion,
    //       crc: synchronizationRecord.getCrc(),
    //       updatedDate,
    //     })
    //     .where('recordId', '=', synchronizationRecord.getRecordId())
    //     .where('version', '=', currentVersion)
    //     .returning(['version'])
    //     .executeTakeFirstOrThrow();
    // } catch (error: any) {
    //   console.warn(`Vertalo Synchronization Record race condition detected for record ${synchronizationRecord.getRecordId()}`);
    // }
  }
}

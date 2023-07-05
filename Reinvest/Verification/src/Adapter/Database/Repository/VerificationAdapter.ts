import { JSONObject } from 'HKEKTypes/Generics';
import { VerificationDatabaseAdapterProvider, verifierRecordsTable } from 'Verification/Adapter/Database/DatabaseAdapter';
import { InsertableVerifierRecord, VerifierRecord } from 'Verification/Adapter/Database/VerificationSchema';
import { VerificationState, VerifierType } from 'Verification/Domain/ValueObject/Verifiers';

export class VerificationAdapter {
  private databaseAdapterProvider: VerificationDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: VerificationDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'VerificationAdapter';

  async findVerifierRecord(id: string): Promise<VerifierRecord | null> {
    try {
      return await this.databaseAdapterProvider
        .provide()
        .selectFrom(verifierRecordsTable)
        .select(['decisionJson', 'id', 'eventsJson', 'ncId', 'type', 'updatedDate', 'accountId'])
        .where(`id`, '=', id)
        .limit(1)
        .$castTo<VerifierRecord>()
        .executeTakeFirstOrThrow();
    } catch (error) {
      return null;
    }
  }

  async findVerifierRecordByPartyId(partyId: string): Promise<VerifierRecord | null> {
    try {
      return await this.databaseAdapterProvider
        .provide()
        .selectFrom(verifierRecordsTable)
        .select(['decisionJson', 'id', 'eventsJson', 'ncId', 'type', 'updatedDate', 'accountId'])
        .where(`ncId`, '=', partyId)
        .limit(1)
        .$castTo<VerifierRecord>()
        .executeTakeFirstOrThrow();
    } catch (error) {
      return null;
    }
  }

  createVerifierRecord(id: string, ncId: string, type: VerifierType, accountId: string | null = null): VerifierRecord {
    return <VerifierRecord>{
      id,
      ncId,
      type,
      accountId,
      eventsJson: {},
      decisionJson: {},
      updatedDate: new Date(),
    };
  }

  async storeVerifierRecords(records: VerificationState[]): Promise<void> {
    if (records.length === 0) {
      return;
    }

    const recordsToStore = records.map((record: VerificationState): InsertableVerifierRecord => {
      return {
        id: record.id,
        ncId: record.ncId,
        type: record.type,
        accountId: record.accountId,
        eventsJson: record.events as unknown as JSONObject,
        decisionJson: <JSONObject>record.decision,
        updatedDate: new Date(),
        createdDate: new Date(),
      };
    });

    await this.databaseAdapterProvider
      .provide()
      .insertInto(verifierRecordsTable)
      .values(recordsToStore)
      .onConflict(oc =>
        oc.column('id').doUpdateSet({
          eventsJson: eb => eb.ref(`excluded.eventsJson`),
          decisionJson: eb => eb.ref(`excluded.decisionJson`),
          updatedDate: eb => eb.ref(`excluded.updatedDate`),
          accountId: eb => eb.ref(`excluded.accountId`),
        }),
      )
      .execute();
  }
}

import { JSONObject } from 'HKEKTypes/Generics';
import { VerificationDatabaseAdapterProvider, verifierRecordsTable } from 'Verification/Adapter/Database/DatabaseAdapter';
import { InsertableVerifierRecord, VerifierRecord } from 'Verification/Adapter/Database/RegistrationSchema';
import { VerificationState, VerifierType } from 'Verification/Domain/ValueObject/Verifiers';

export class VerificationAdapter {
  public static getClassName = (): string => 'VerificationAdapter';
  private databaseAdapterProvider: VerificationDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: VerificationDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  async findVerifierRecord(id: string): Promise<VerifierRecord | null> {
    try {
      return await this.databaseAdapterProvider
        .provide()
        .selectFrom(verifierRecordsTable)
        .select(['decisionJson', 'id', 'eventsJson', 'ncId', 'type', 'updatedDate'])
        .where(`id`, '=', id)
        .limit(1)
        .$castTo<VerifierRecord>()
        .executeTakeFirstOrThrow();
    } catch (error) {
      return null;
    }
  }

  createVerifierRecord(id: string, ncId: string, type: VerifierType): VerifierRecord {
    return <VerifierRecord>{
      id,
      ncId,
      type,
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
        }),
      )
      .execute();
  }
}

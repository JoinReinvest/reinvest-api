import { VerificationDatabaseAdapterProvider, verifierRecordsTable } from 'Verification/Adapter/Database/DatabaseAdapter';
import { InsertableVerifierRecord, VerifierRecord } from 'Verification/Adapter/Database/RegistrationSchema';
import { VerificationState, VerifierType } from 'Verification/Domain/ValueObject/Verifiers';

export class VerificationRepository {
  public static getClassName = (): string => 'VerificationRepository';
  private databaseAdapterProvider: VerificationDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: VerificationDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  async findVerifierRecord(id: string): Promise<VerifierRecord | null> {
    try {
      return await this.databaseAdapterProvider
        .provide()
        .selectFrom(verifierRecordsTable)
        .select(['aml', 'decisions', 'id', 'kyc', 'ncId', 'type', 'updatedDate'])
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
      aml: [],
      kyc: [],
      decisions: [],
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
        aml: JSON.stringify(record.aml),
        kyc: JSON.stringify(record.kyc),
        decisions: JSON.stringify(record.decisions),
        updatedDate: new Date(),
        createdDate: new Date(),
      };
    });

    await this.databaseAdapterProvider
      .provide()
      .insertInto(verifierRecordsTable)
      .values(recordsToStore)
      // todo on conflict no work - verify why
      .onConflict(oc =>
        oc.column('id').doUpdateSet({
          aml: eb => eb.ref(`${verifierRecordsTable}.aml`),
          kyc: eb => eb.ref(`${verifierRecordsTable}.kyc`),
          decisions: eb => eb.ref(`${verifierRecordsTable}.decisions`),
          updatedDate: eb => eb.ref(`${verifierRecordsTable}.updatedDate`),
        }),
      )
      .execute();
  }
}

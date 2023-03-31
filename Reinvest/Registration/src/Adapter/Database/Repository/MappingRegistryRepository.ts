import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { RegistrationDatabaseAdapterProvider, registrationMappingRegistryTable } from 'Registration/Adapter/Database/DatabaseAdapter';
import { InsertableMappingRegistry, SelectableMappedRecord } from 'Registration/Adapter/Database/RegistrationSchema';
import { EmailCreator } from 'Registration/Domain/EmailCreator';
import { MappedRecord, MappedRecordType } from 'Registration/Domain/Model/Mapping/MappedRecord';
import { MappedRecordStatus, MappedType } from 'Registration/Domain/Model/Mapping/MappedType';

const LOCK_TIME_SECONDS = 30;

export class MappingRegistryRepository {
  public static getClassName = (): string => 'MappingRegistryRepository';
  private databaseAdapterProvider: RegistrationDatabaseAdapterProvider;

  private idGenerator: IdGeneratorInterface;
  private emailCreator: EmailCreator;

  constructor(databaseAdapterProvider: RegistrationDatabaseAdapterProvider, uniqueGenerator: IdGeneratorInterface, emailCreator: EmailCreator) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.idGenerator = uniqueGenerator;
    this.emailCreator = emailCreator;
  }

  async addRecord(profileId: string, externalId: string, mappedType: MappedType): Promise<MappedRecord> {
    const email = this.emailCreator.create(profileId, externalId, mappedType);
    // close connection
    const recordId = this.idGenerator.createUuid();

    await this.databaseAdapterProvider
      .provide()
      .insertInto(registrationMappingRegistryTable)
      .values(<InsertableMappingRegistry>{
        recordId,
        profileId,
        externalId,
        mappedType,
        email,
      })
      .onConflict(oc => oc.constraint('profile_external_ids_unique').doNothing())
      .execute();

    return this.getRecordByProfileAndExternalId(profileId, externalId);
  }

  async getRecordByProfileAndExternalId(profileId: string, externalId: string): Promise<MappedRecord> {
    const data = (await this.databaseAdapterProvider
      .provide()
      .selectFrom(registrationMappingRegistryTable)
      .select(['recordId', 'profileId', 'externalId', 'mappedType', 'email', 'status', 'version'])
      .where('profileId', '=', profileId)
      .where('externalId', '=', externalId)
      .limit(1)
      .executeTakeFirstOrThrow()) as SelectableMappedRecord as MappedRecordType;

    return MappedRecord.create(data);
  }

  async lockRecord(record: MappedRecord) {
    const lockedUntil = new Date();
    lockedUntil.setSeconds(lockedUntil.getSeconds() + LOCK_TIME_SECONDS);
    const currentVersion = record.getVersion();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(registrationMappingRegistryTable)
        .set({ lockedUntil })
        .where('recordId', '=', record.getRecordId())
        .where('version', '=', currentVersion)
        .where(qb => qb.where('lockedUntil', '<=', new Date()).orWhere('lockedUntil', 'is', null))
        .returning(['lockedUntil'])
        .executeTakeFirstOrThrow();

      return true;
    } catch (error: any) {
      console.log(error);

      return false;
    }
  }

  async setClean(record: MappedRecord) {
    const updatedDate = new Date();
    const currentVersion = record.getVersion();
    const nextVersion = record.getNextVersion();

    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(registrationMappingRegistryTable)
        .set({
          status: MappedRecordStatus.CLEAN,
          version: nextVersion,
          updatedDate,
          lockedUntil: null,
        })
        .where('recordId', '=', record.getRecordId())
        .where('version', '=', currentVersion)
        .returning(['version'])
        .executeTakeFirstOrThrow();

      return true;
    } catch (error: any) {
      console.log(error);

      return false;
    }
  }

  /**
   * Set dirty and clear lock - it expropriates all other operations on this record
   * @param record
   */
  async setDirty(record: MappedRecord) {
    const updatedDate = new Date();
    const nextVersion = record.getNextVersion();

    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(registrationMappingRegistryTable)
        .set({
          status: MappedRecordStatus.DIRTY,
          version: nextVersion,
          lockedUntil: null,
          updatedDate,
        })
        .where('recordId', '=', record.getRecordId())
        .returning(['version'])
        .executeTakeFirstOrThrow();

      return true;
    } catch (error: any) {
      console.log(error);

      return false;
    }
  }

  async unlockRecord(record: MappedRecord) {
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(registrationMappingRegistryTable)
        .set({
          lockedUntil: null,
        })
        .where('recordId', '=', record.getRecordId())
        .where('version', '=', record.getVersion())
        .returning(['version'])
        .executeTakeFirstOrThrow();

      return true;
    } catch (error: any) {
      console.log(error);

      return false;
    }
  }
}

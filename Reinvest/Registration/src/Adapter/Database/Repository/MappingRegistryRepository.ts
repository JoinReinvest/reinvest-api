import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { RegistrationDatabaseAdapterProvider, registrationMappingRegistryTable } from 'Registration/Adapter/Database/DatabaseAdapter';
import { InsertableMappingRegistry, SelectableMappedRecord } from 'Registration/Adapter/Database/RegistrationSchema';
import { EmailCreator } from 'Registration/Domain/EmailCreator';
import { MappedRecord, MappedRecordType } from 'Registration/Domain/Model/Mapping/MappedRecord';
import { MappedRecordStatus, MappedType } from 'Registration/Domain/Model/Mapping/MappedType';

const LOCK_TIME_SECONDS = 30;
export const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';

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

  async addRecord(mappedType: MappedType, profileId: string, externalId: string = EMPTY_UUID, dependentId: string = EMPTY_UUID): Promise<MappedRecord> {
    const email = this.emailCreator.create(profileId, externalId, dependentId, mappedType);
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
        dependentId,
      })
      .onConflict(oc => oc.constraint('profile_external_ids_unique').doNothing())
      .execute();

    return this.getRecordByProfileAndExternalId(profileId, externalId, dependentId);
  }

  async getRecordByProfileAndExternalId(profileId: string, externalId: string, dependentId: string): Promise<MappedRecord> {
    const data = (await this.databaseAdapterProvider
      .provide()
      .selectFrom(registrationMappingRegistryTable)
      .select(['recordId', 'profileId', 'externalId', 'dependentId', 'mappedType', 'email', 'status', 'version'])
      .where('profileId', '=', profileId)
      .where('externalId', '=', externalId)
      .where('dependentId', '=', dependentId)
      .limit(1)
      .executeTakeFirstOrThrow()) as SelectableMappedRecord as MappedRecordType;

    return MappedRecord.create(data);
  }

  async getCompanyAccountRecordByProfileAndExternalId(profileId: string, externalId: string): Promise<MappedRecord | null> {
    const data = (await this.databaseAdapterProvider
      .provide()
      .selectFrom(registrationMappingRegistryTable)
      .select(['recordId', 'profileId', 'externalId', 'dependentId', 'mappedType', 'email', 'status', 'version'])
      .where('profileId', '=', profileId)
      .where('externalId', '=', externalId)
      .where('mappedType', 'in', [MappedType.CORPORATE_ACCOUNT, MappedType.TRUST_ACCOUNT])
      .limit(1)
      .executeTakeFirst()) as SelectableMappedRecord as MappedRecordType;

    if (!data) {
      return null;
    }

    return MappedRecord.create(data);
  }

  async getIndividualAccountRecordByProfile(profileId: string): Promise<MappedRecord | null> {
    const data = (await this.databaseAdapterProvider
      .provide()
      .selectFrom(registrationMappingRegistryTable)
      .select(['recordId', 'profileId', 'externalId', 'dependentId', 'mappedType', 'email', 'status', 'version'])
      .where('profileId', '=', profileId)
      .where('mappedType', '=', MappedType.INDIVIDUAL_ACCOUNT)
      .limit(1)
      .executeTakeFirst()) as SelectableMappedRecord as MappedRecordType;

    if (!data) {
      return null;
    }

    return MappedRecord.create(data);
  }

  async getRecordById(recordId: string): Promise<MappedRecord> {
    const data = (await this.databaseAdapterProvider
      .provide()
      .selectFrom(registrationMappingRegistryTable)
      .select(['recordId', 'profileId', 'externalId', 'dependentId', 'mappedType', 'email', 'status', 'version'])
      .where('recordId', '=', recordId)
      .limit(1)
      .executeTakeFirstOrThrow()) as SelectableMappedRecord as MappedRecordType;

    return MappedRecord.create(data);
  }

  async findByProfile(profileId: string): Promise<MappedRecord> {
    const data = (await this.databaseAdapterProvider
      .provide()
      .selectFrom(registrationMappingRegistryTable)
      .select(['recordId', 'profileId', 'externalId', 'dependentId', 'mappedType', 'email', 'status', 'version'])
      .where('profileId', '=', profileId)
      .where('mappedType', '=', MappedType.PROFILE)
      .limit(1)
      .executeTakeFirstOrThrow()) as SelectableMappedRecord as MappedRecordType;

    return MappedRecord.create(data);
  }

  async getCompanyById(profileId: string, accountId: string): Promise<MappedRecord> {
    const data = (await this.databaseAdapterProvider
      .provide()
      .selectFrom(registrationMappingRegistryTable)
      .select(['recordId', 'profileId', 'externalId', 'dependentId', 'mappedType', 'email', 'status', 'version'])
      .where('profileId', '=', profileId)
      .where('externalId', '=', accountId)
      .where('mappedType', '=', MappedType.COMPANY)
      .limit(1)
      .executeTakeFirstOrThrow()) as SelectableMappedRecord as MappedRecordType;

    return MappedRecord.create(data);
  }

  async getStakeholderById(profileId: string, accountId: string, stakeholderId: string): Promise<MappedRecord> {
    const data = (await this.databaseAdapterProvider
      .provide()
      .selectFrom(registrationMappingRegistryTable)
      .select(['recordId', 'profileId', 'externalId', 'dependentId', 'mappedType', 'email', 'status', 'version'])
      .where('profileId', '=', profileId)
      .where('externalId', '=', accountId)
      .where('dependentId', '=', stakeholderId)
      .where('mappedType', '=', MappedType.STAKEHOLDER)
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

  async setCompanyAndStakeholdersAsDirty(profileId: UUID, accountId: UUID) {
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(registrationMappingRegistryTable)
        .set({ status: MappedRecordStatus.DIRTY })
        .where('profileId', '=', profileId)
        .where('externalId', '=', accountId)
        .where('mappedType', 'in', [MappedType.COMPANY, MappedType.STAKEHOLDER])
        .execute();

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
          updatedDate: new Date(),
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

  async listObjectsToSync(): Promise<string[]> {
    try {
      const data = await this.databaseAdapterProvider
        .provide()
        .selectFrom(registrationMappingRegistryTable)
        .select(['recordId'])
        .where('status', '=', MappedRecordStatus.DIRTY)
        .orWhere('status', '=', MappedRecordStatus.TO_BE_DELETED)
        .orderBy('updatedDate', 'asc')
        .limit(20)
        .execute();

      return data.map((row: any) => row.recordId);
    } catch (error: any) {
      console.log(error.message);

      return [];
    }
  }
}

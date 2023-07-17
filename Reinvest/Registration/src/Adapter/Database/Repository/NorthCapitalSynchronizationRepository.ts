import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import {
  northCapitalSynchronizationTable,
  RegistrationDatabaseAdapterProvider,
  registrationMappingRegistryTable,
} from 'Registration/Adapter/Database/DatabaseAdapter';
import {
  InsertableNorthCapitalSynchronization,
  SelectableNorthCapitalSynchronizationRecord,
  SelectablePartyId,
} from 'Registration/Adapter/Database/RegistrationSchema';
import {
  NorthCapitalEntityType,
  NorthCapitalSynchronizationRecord,
  NorthCapitalSynchronizationRecordType,
} from 'Registration/Adapter/NorthCapital/NorthCapitalSynchronizationRecord';
import { MappedType } from 'Registration/Domain/Model/Mapping/MappedType';
import { NorthCapitalSynchronizationMapping } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes';
import { DateTime } from 'Money/DateTime';

export class NorthCapitalSynchronizationRepository {
  public static getClassName = (): string => 'NorthCapitalSynchronizationRepository';
  private databaseAdapterProvider: RegistrationDatabaseAdapterProvider;

  private idGenerator: IdGeneratorInterface;

  constructor(databaseAdapterProvider: RegistrationDatabaseAdapterProvider, uniqueGenerator: IdGeneratorInterface) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.idGenerator = uniqueGenerator;
  }

  async getSynchronizationRecord(recordId: string): Promise<NorthCapitalSynchronizationRecord | null> {
    try {
      const data = (await this.databaseAdapterProvider
        .provide()
        .selectFrom(northCapitalSynchronizationTable)
        .select(['recordId', 'northCapitalId', 'type', 'crc', 'version', 'links'])
        .where('recordId', '=', recordId)
        .limit(1)
        .executeTakeFirstOrThrow()) as SelectableNorthCapitalSynchronizationRecord as NorthCapitalSynchronizationRecordType;

      return NorthCapitalSynchronizationRecord.create(data);
    } catch (error: any) {
      return null;
    }
  }

  async createSynchronizationRecord(recordId: string, northCapitalId: string, crc: string, entityType: NorthCapitalEntityType): Promise<void> {
    await this.databaseAdapterProvider
      .provide()
      .insertInto(northCapitalSynchronizationTable)
      .values(<InsertableNorthCapitalSynchronization>{
        recordId,
        northCapitalId,
        crc,
        type: entityType,
        version: 0,
        links: JSON.stringify([]),
      })
      .onConflict(oc => oc.columns(['recordId']).doNothing())
      .execute();
  }

  async updateSynchronizationRecord(synchronizationRecord: NorthCapitalSynchronizationRecord): Promise<void> {
    if (!synchronizationRecord.wasUpdated()) {
      return;
    }

    const updatedDate = DateTime.now().toDate();
    const nextVersion = synchronizationRecord.getNextVersion();
    const currentVersion = synchronizationRecord.getVersion();

    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(northCapitalSynchronizationTable)
        .set({
          version: nextVersion,
          crc: synchronizationRecord.getCrc(),
          updatedDate,
          links: JSON.stringify(synchronizationRecord.getLinks()),
        })
        .where('recordId', '=', synchronizationRecord.getRecordId())
        .where('version', '=', currentVersion)
        .returning(['version'])
        .executeTakeFirstOrThrow();
    } catch (error: any) {
      console.warn(`North Capital Synchronization Record race condition detected for record ${synchronizationRecord.getRecordId()}`);
    }
  }

  async getMainPartyIdByProfile(profileId: string): Promise<string | never> {
    try {
      const data = await this.databaseAdapterProvider
        .provide()
        .selectFrom(registrationMappingRegistryTable)
        .fullJoin(northCapitalSynchronizationTable, `${northCapitalSynchronizationTable}.recordId`, `${registrationMappingRegistryTable}.recordId`)
        .select([`${northCapitalSynchronizationTable}.northCapitalId`])
        .where(`${registrationMappingRegistryTable}.profileId`, '=', profileId)
        .where(`${registrationMappingRegistryTable}.mappedType`, '=', MappedType.PROFILE)
        .limit(1)
        .castTo<SelectablePartyId>()
        .executeTakeFirstOrThrow();

      return data.northCapitalId;
    } catch (error: any) {
      throw new Error('MAIN_PARTY_NOT_FOUND');
    }
  }

  async getProfileIdOfRecord(recordId: string): Promise<string | never> {
    try {
      const data = await this.databaseAdapterProvider
        .provide()
        .selectFrom(registrationMappingRegistryTable)
        .select(['profileId'])
        .where('recordId', '=', recordId)
        .limit(1)
        .executeTakeFirstOrThrow();

      return data.profileId;
    } catch (error: any) {
      throw new Error('PROFILE_NOT_FOUND');
    }
  }

  async getAllProfileSynchronizationMapping(recordId: string): Promise<NorthCapitalSynchronizationMapping[]> {
    const { profileId } = await this.databaseAdapterProvider
      .provide()
      .selectFrom(registrationMappingRegistryTable)
      .select(['profileId'])
      .where('recordId', '=', recordId)
      .limit(1)
      .executeTakeFirstOrThrow();

    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(registrationMappingRegistryTable)
      .fullJoin(northCapitalSynchronizationTable, `${northCapitalSynchronizationTable}.recordId`, `${registrationMappingRegistryTable}.recordId`)
      .select([`${northCapitalSynchronizationTable}.northCapitalId`])
      .select([
        `${registrationMappingRegistryTable}.profileId`,
        `${registrationMappingRegistryTable}.externalId`,
        `${registrationMappingRegistryTable}.mappedType`,
      ])
      .where(`${registrationMappingRegistryTable}.profileId`, '=', profileId)
      .execute();

    return data.map((row: any) => {
      return {
        mapping: {
          type: row.mappedType,
          profileId: row.profileId,
          externalId: row.externalId,
        },
        northCapitalId: row.northCapitalId,
      };
    });
  }
}

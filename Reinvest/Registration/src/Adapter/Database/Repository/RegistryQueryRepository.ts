import {
  northCapitalSynchronizationTable,
  RegistrationDatabaseAdapterProvider,
  registrationMappingRegistryTable,
} from 'Registration/Adapter/Database/DatabaseAdapter';
import { EMPTY_UUID } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { MappedType } from 'Registration/Domain/Model/Mapping/MappedType';
import { ObjectMapping } from 'Registration/Port/Api/RegistryQuery';

export type NCAccountStructureMapping = {
  dependentId: string;
  externalId: string;
  mappedType: MappedType;
  northCapitalId: string;
  recordId: string;
  status: string;
};

export class RegistryQueryRepository {
  private databaseAdapterProvider: RegistrationDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: RegistrationDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'RegistryQueryRepository';

  async getNorthCapitalAccountStructure(profileId: string, accountId: string): Promise<NCAccountStructureMapping[]> {
    try {
      return await this.databaseAdapterProvider
        .provide()
        .selectFrom(registrationMappingRegistryTable)
        .fullJoin(northCapitalSynchronizationTable, `${registrationMappingRegistryTable}.recordId`, `${northCapitalSynchronizationTable}.recordId`)
        .select([
          `${registrationMappingRegistryTable}.recordId`,
          `${registrationMappingRegistryTable}.externalId`,
          `${registrationMappingRegistryTable}.mappedType`,
          `${registrationMappingRegistryTable}.status`,
          `${registrationMappingRegistryTable}.dependentId`,
        ])
        .select([`${northCapitalSynchronizationTable}.northCapitalId`])
        .where(`${registrationMappingRegistryTable}.profileId`, '=', profileId)
        .where(qb => qb.where('externalId', '=', accountId).orWhere('externalId', '=', EMPTY_UUID))
        .castTo<NCAccountStructureMapping>()
        .execute();
    } catch (error: any) {
      console.warn(`Cannot find account structure for id: ${profileId}/${accountId}`, error.message);

      return [];
    }
  }

  async getAccountStructureForSynchronization(profileId: string, accountId: string): Promise<NCAccountStructureMapping[]> {
    try {
      return await this.databaseAdapterProvider
        .provide()
        .selectFrom(registrationMappingRegistryTable)
        .leftJoin(northCapitalSynchronizationTable, `${registrationMappingRegistryTable}.recordId`, `${northCapitalSynchronizationTable}.recordId`)
        .select([
          `${registrationMappingRegistryTable}.recordId`,
          `${registrationMappingRegistryTable}.externalId`,
          `${registrationMappingRegistryTable}.mappedType`,
          `${registrationMappingRegistryTable}.status`,
          `${registrationMappingRegistryTable}.dependentId`,
        ])
        .select([`${northCapitalSynchronizationTable}.northCapitalId`])
        .where(`${registrationMappingRegistryTable}.profileId`, '=', profileId)
        .where(qb => qb.where('externalId', '=', accountId).orWhere('externalId', '=', EMPTY_UUID))
        .castTo<NCAccountStructureMapping>()
        .execute();
    } catch (error: any) {
      console.warn(`Cannot find account structure for id: ${profileId}/${accountId}`, error.message);

      return [];
    }
  }

  async findNorthCapitalAccountId(profileId: string, accountId: string): Promise<string | null> {
    try {
      const result = await this.databaseAdapterProvider
        .provide()
        .selectFrom(registrationMappingRegistryTable)
        .fullJoin(northCapitalSynchronizationTable, `${registrationMappingRegistryTable}.recordId`, `${northCapitalSynchronizationTable}.recordId`)
        .select([`${northCapitalSynchronizationTable}.northCapitalId`])
        .where(`${registrationMappingRegistryTable}.profileId`, '=', profileId)
        .where(`${registrationMappingRegistryTable}.externalId`, '=', accountId)
        .where(`${registrationMappingRegistryTable}.mappedType`, 'in', [MappedType.INDIVIDUAL_ACCOUNT, MappedType.CORPORATE_ACCOUNT, MappedType.TRUST_ACCOUNT])
        .castTo<{ northCapitalId: string }>()
        .executeTakeFirstOrThrow();

      return result.northCapitalId;
    } catch (error: any) {
      console.warn(`Cannot find account structure for id: ${profileId}/${accountId}`, error.message);

      return null;
    }
  }

  async getAccountMapping(accountId: string): Promise<{ email: string; northCapitalId: string | null } | null> {
    try {
      const result = await this.databaseAdapterProvider
        .provide()
        .selectFrom(registrationMappingRegistryTable)
        .leftJoin(northCapitalSynchronizationTable, `${registrationMappingRegistryTable}.recordId`, `${northCapitalSynchronizationTable}.recordId`)
        .select([`${northCapitalSynchronizationTable}.northCapitalId`])
        .select([`${registrationMappingRegistryTable}.email`])
        .where(`${registrationMappingRegistryTable}.externalId`, '=', accountId)
        .where(`${registrationMappingRegistryTable}.mappedType`, 'in', [
          MappedType.INDIVIDUAL_ACCOUNT,
          MappedType.CORPORATE_ACCOUNT,
          MappedType.TRUST_ACCOUNT,
          MappedType.BENEFICIARY_ACCOUNT,
        ])
        .castTo<{ email: string; northCapitalId: string | null }>()
        .executeTakeFirstOrThrow();

      return result;
    } catch (error: any) {
      console.warn(`Cannot find account mapping for id: ${accountId}`, error.message);

      return null;
    }
  }

  async getMappingByPartyId(partyId: string): Promise<ObjectMapping | null> {
    const result = await this.databaseAdapterProvider
      .provide()
      .selectFrom(northCapitalSynchronizationTable)
      .innerJoin(registrationMappingRegistryTable, `${northCapitalSynchronizationTable}.recordId`, `${registrationMappingRegistryTable}.recordId`)
      .select([
        `${registrationMappingRegistryTable}.profileId`,
        `${registrationMappingRegistryTable}.externalId`,
        `${registrationMappingRegistryTable}.mappedType`,
        `${registrationMappingRegistryTable}.dependentId`,
      ])
      .where(`${northCapitalSynchronizationTable}.northCapitalId`, '=', partyId)
      .executeTakeFirst();

    if (!result) {
      return null;
    }

    const type = result.mappedType as MappedType;

    return {
      partyId,
      profileId: result.profileId,
      accountId: type !== MappedType.PROFILE ? result.externalId : null,
      stakeholderId: type === MappedType.STAKEHOLDER ? result.dependentId : null,
      type,
    };
  }
}

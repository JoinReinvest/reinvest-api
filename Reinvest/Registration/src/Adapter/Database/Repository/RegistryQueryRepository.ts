import {
  northCapitalSynchronizationTable,
  RegistrationDatabaseAdapterProvider,
  registrationMappingRegistryTable,
} from 'Registration/Adapter/Database/DatabaseAdapter';
import { EMPTY_UUID } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { MappedType } from 'Registration/Domain/Model/Mapping/MappedType';

export type NCAccountStructureMapping = {
  dependentId: string;
  externalId: string;
  mappedType: MappedType;
  northCapitalId: string;
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
}

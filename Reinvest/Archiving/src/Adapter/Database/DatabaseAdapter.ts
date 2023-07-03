import { ArchivingBeneficiaryTable } from 'Archiving/Adapter/Database/ArchivingSchema';
import { Kysely } from 'kysely/dist/esm';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';

export const archivingBeneficiary = 'archiving_beneficiary';

export interface ArchivingDatabase {
  [archivingBeneficiary]: ArchivingBeneficiaryTable;
}

export const ArchivingDatabaseAdapterInstance = 'ArchivingDatabaseAdapter';
export type DatabaseAdapter = Kysely<ArchivingDatabase>;
export type ArchivingDatabaseAdapterProvider = DatabaseProvider<ArchivingDatabase>;

export function DatabaseAdapterProvider(config: PostgreSQLConfig): ArchivingDatabaseAdapterProvider {
  return new DatabaseProvider<ArchivingDatabase>(config);
}

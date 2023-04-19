import { Kysely } from 'kysely';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';

// export const verificationMappingRegistryTable = 'verification_mapping_registry';

export interface VerificationDatabase {
  // [northCapitalDocumentsSynchronizationTable]: NorthCapitalDocumentsSynchronizationTable;
}

export const VerificationDatabaseAdapterInstanceProvider = 'VerificationDatabaseAdapterProvider';
export type VerificationDatabaseAdapterProvider = DatabaseProvider<VerificationDatabase>;

export function createVerificationDatabaseAdapterProvider(config: PostgreSQLConfig): VerificationDatabaseAdapterProvider {
  return new DatabaseProvider<VerificationDatabase>(config);
}

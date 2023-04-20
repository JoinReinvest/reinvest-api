import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { VerifierRecordsTable } from 'Verification/Adapter/Database/RegistrationSchema';

export const verifierRecordsTable = 'verifier_records';

export interface VerificationDatabase {
  [verifierRecordsTable]: VerifierRecordsTable;
}

export const VerificationDatabaseAdapterInstanceProvider = 'VerificationDatabaseAdapterProvider';
export type VerificationDatabaseAdapterProvider = DatabaseProvider<VerificationDatabase>;

export function createVerificationDatabaseAdapterProvider(config: PostgreSQLConfig): VerificationDatabaseAdapterProvider {
  return new DatabaseProvider<VerificationDatabase>(config);
}

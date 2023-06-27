import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { VerificationFeesTable, VerifierRecordsTable } from 'Verification/Adapter/Database/VerificationSchema';

export const verifierRecordsTable = 'verifier_records';
export const verificationFeesTable = 'verification_fees';

export interface VerificationDatabase {
  [verifierRecordsTable]: VerifierRecordsTable;
  [verificationFeesTable]: VerificationFeesTable;
}

export const VerificationDatabaseAdapterInstanceProvider = 'VerificationDatabaseAdapterProvider';
export type VerificationDatabaseAdapterProvider = DatabaseProvider<VerificationDatabase>;

export function createVerificationDatabaseAdapterProvider(config: PostgreSQLConfig): VerificationDatabaseAdapterProvider {
  return new DatabaseProvider<VerificationDatabase>(config);
}

import { Kysely } from 'kysely/dist/esm';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';

export interface DocumentsDatabase {
  // investment_accounts_profile_aggregate: AggregateTable,
  // investment_accounts_profile_query: ProfileQueryTable,
}

export const DatabaseAdapterInstance = 'DatabaseAdapter';
export type DatabaseAdapter = Kysely<DocumentsDatabase>;

export function DatabaseAdapterProvider(config: PostgreSQLConfig): DatabaseAdapter {
  return new DatabaseProvider<DocumentsDatabase>(config).provide() as unknown as DatabaseAdapter;
}

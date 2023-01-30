import {DatabaseProvider, PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {Kysely} from "kysely/dist/esm";

export interface IdentityDatabase {
    // investment_accounts_profile_aggregate: AggregateTable,
    // investment_accounts_profile_query: ProfileQueryTable,

}

export const DatabaseAdapterInstance = "DatabaseAdapter";
export type DatabaseAdapter = Kysely<IdentityDatabase>;

export function DatabaseAdapterProvider(config: PostgreSQLConfig): DatabaseAdapter {
    return new DatabaseProvider<IdentityDatabase>(config).provide() as unknown as DatabaseAdapter;
}
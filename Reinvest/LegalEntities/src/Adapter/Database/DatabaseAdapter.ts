import {DatabaseProvider, PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {Kysely} from "kysely/dist/esm";

export interface LegalEntitiesDatabase {
    // investment_accounts_profile_aggregate: AggregateTable,
    // investment_accounts_profile_query: ProfileQueryTable,

}

export const DatabaseAdapterInstance = "DatabaseAdapter";
export type DatabaseAdapter = Kysely<LegalEntitiesDatabase>;

export function DatabaseAdapterProvider(config: PostgreSQLConfig): DatabaseAdapter {
    return new DatabaseProvider<LegalEntitiesDatabase>(config).provide() as unknown as DatabaseAdapter;
}
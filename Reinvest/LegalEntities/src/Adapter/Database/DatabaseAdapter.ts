import {DatabaseProvider, PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {Kysely} from "kysely";
import {LegalEntitiesProfile} from "LegalEntities/Adapter/Database/LegalEntitiesSchema";

// export const legalEntitiesPersonTable = "legal_entities_person";
export const legalEntitiesProfileTable = "legal_entities_profile";

export interface LegalEntitiesDatabase {
    // [legalEntitiesPersonTable]: LegalEntitiesPerson,
    [legalEntitiesProfileTable]: LegalEntitiesProfile,
}

export const LegalEntitiesDatabaseAdapterInstanceProvider = "LegalEntitiesDatabaseAdapterProvider";
export type LegalEntitiesDatabaseAdapter = Kysely<LegalEntitiesDatabase>;
export type LegalEntitiesDatabaseAdapterProvider = DatabaseProvider<LegalEntitiesDatabase>;

export function createLegalEntitiesDatabaseAdapterProvider(config: PostgreSQLConfig): LegalEntitiesDatabaseAdapterProvider {
    return new DatabaseProvider<LegalEntitiesDatabase>(config);
}
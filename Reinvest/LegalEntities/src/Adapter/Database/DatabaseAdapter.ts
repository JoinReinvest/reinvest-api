import {DatabaseProvider, PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {Kysely} from "kysely";
import {LegalEntitiesDraftAccount, LegalEntitiesProfile} from "LegalEntities/Adapter/Database/LegalEntitiesSchema";

// export const legalEntitiesPersonTable = "legal_entities_person";
export const legalEntitiesProfileTable = "legal_entities_profile";
export const legalEntitiesDraftAccountTable = "legal_entities_draft_accounts";

export interface LegalEntitiesDatabase {
    [legalEntitiesDraftAccountTable]: LegalEntitiesDraftAccount,
    [legalEntitiesProfileTable]: LegalEntitiesProfile,
}

export const LegalEntitiesDatabaseAdapterInstanceProvider = "LegalEntitiesDatabaseAdapterProvider";
export type LegalEntitiesDatabaseAdapter = Kysely<LegalEntitiesDatabase>;
export type LegalEntitiesDatabaseAdapterProvider = DatabaseProvider<LegalEntitiesDatabase>;

export function createLegalEntitiesDatabaseAdapterProvider(config: PostgreSQLConfig): LegalEntitiesDatabaseAdapterProvider {
    return new DatabaseProvider<LegalEntitiesDatabase>(config);
}
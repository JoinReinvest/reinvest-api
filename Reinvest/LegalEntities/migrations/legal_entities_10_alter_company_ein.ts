import {Kysely, sql} from 'kysely';
import {
    LegalEntitiesDatabase, legalEntitiesCompanyAccountTable,
} from "LegalEntities/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema
        .alterTable(legalEntitiesCompanyAccountTable)
        .alterColumn('einHash', col => col.setDefault(null))
        .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
}

import {Kysely} from 'kysely';
import {
    LegalEntitiesDatabase,
    legalEntitiesProfileTable
} from "LegalEntities/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema
        .alterTable(legalEntitiesProfileTable)
        .dropColumn('avatar')
        .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema
        .alterTable(legalEntitiesProfileTable)
        .addColumn('avatar', 'json', col => col.defaultTo(null))
        .execute();

}

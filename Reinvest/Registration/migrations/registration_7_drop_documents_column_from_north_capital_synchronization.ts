import {Kysely} from 'kysely';
import {LegalEntitiesDatabase} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {
    northCapitalSynchronizationTable
} from "Registration/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema
        .alterTable(northCapitalSynchronizationTable)
        .dropColumn('documents')
        .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema
        .alterTable(northCapitalSynchronizationTable)
        .addColumn('documents', 'json', col => col.defaultTo(null))
        .execute();
}

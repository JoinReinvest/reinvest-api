import {Kysely, sql} from 'kysely';
import {LegalEntitiesDatabase, legalEntitiesDraftAccountTable} from "LegalEntities/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema
        .createTable(legalEntitiesDraftAccountTable)
        .addColumn('draftId', 'uuid', col => col.primaryKey().notNull().unique())
        .addColumn('profileId', 'uuid', col => col.notNull())
        .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
        .addColumn('state', 'varchar(36)', col => col.notNull())
        .addColumn('accountType', 'varchar(36)', col => col.notNull())
        .addColumn('data', 'json', col => col.defaultTo(null))
        .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema.dropTable(legalEntitiesDraftAccountTable).execute();
}

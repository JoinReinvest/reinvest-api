import {Kysely, sql} from 'kysely';
import {LegalEntitiesDatabase} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {
    northCapitalSynchronizationTable,
    registrationMappingRegistryTable, vertaloSynchronizationTable
} from "Registration/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema
        .createTable(vertaloSynchronizationTable)
        .addColumn('recordId', 'uuid', col => col.primaryKey().notNull().unique())
        .addColumn('vertaloId', 'varchar(255)', col => col.notNull())
        .addColumn('type', 'varchar(10)', col => col.notNull())
        .addColumn('crc', 'varchar(255)', col => col.notNull())
        .addColumn('documents', 'json', col => col.defaultTo(null))
        .addColumn('version', 'integer', col => col.defaultTo(0))
        .addColumn('createdDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
        .addColumn('updatedDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
        .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema.dropTable(vertaloSynchronizationTable).execute();
}

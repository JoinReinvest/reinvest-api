import {Kysely, sql} from 'kysely';
import {LegalEntitiesDatabase} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {
    northCapitalDocumentsSynchronizationTable
} from "Registration/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema
        .createTable(northCapitalDocumentsSynchronizationTable)
        .addColumn('id', 'uuid', col => col.primaryKey().notNull().unique())
        .addColumn('recordId', 'uuid', col => col.notNull())
        .addColumn('northCapitalId', 'varchar(255)', col => col.notNull())
        .addColumn('northCapitalType', 'varchar(255)', col => col.notNull())
        .addColumn('documentId', 'uuid', col => col.unique().notNull())
        .addColumn('documentPath', 'varchar(255)', col => col.notNull())
        .addColumn('documentFilename', 'varchar(255)', col => col.notNull())
        .addColumn('version', 'integer', col => col.defaultTo(0))
        .addColumn('state', 'varchar(20)', col => col.notNull())
        .addColumn('createdDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
        .addColumn('updatedDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
        .execute();

    await db.schema
        .createIndex('registration_north_capital_documents_synchronization_document_id_index')
        .on(northCapitalDocumentsSynchronizationTable)
        .column('documentId')
        .execute();

    await db.schema
        .createIndex('registration_north_capital_documents_synchronization_state_index')
        .on(northCapitalDocumentsSynchronizationTable)
        .column('state')
        .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema.dropIndex('registration_north_capital_documents_synchronization_state_index').execute();
    await db.schema.dropIndex('registration_north_capital_documents_synchronization_document_id_index').execute();
    await db.schema.dropTable(northCapitalDocumentsSynchronizationTable).execute();
}

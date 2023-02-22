import {Kysely} from "kysely";

export async function createAggregateTable<Database>(db: Kysely<Database>, tableName: string) {
    await db.schema
        .createTable(tableName)
        .addColumn('aggregateId', 'uuid', col => col.primaryKey().notNull().unique())
        .addColumn('dateCreated', 'timestamp', col => col.notNull())
        .addColumn('dateUpdated', 'timestamp', col => col.notNull())
        .addColumn('currentVersion', 'bigint', col => col.notNull())
        .addColumn('previousVersion', 'bigint', col => col.notNull())
        .addColumn('kind', 'varchar(36)', col => col.notNull())
        .addColumn('state', 'json')
        .execute();
}
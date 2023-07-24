import { Kysely, sql } from 'kysely';
import { VerificationDatabase, verifierRecordsTable } from 'Verification/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<VerificationDatabase>): Promise<void> {
  await db.schema
    .createTable(verifierRecordsTable)
    .addColumn('id', 'uuid', col => col.primaryKey().notNull().unique())
    .addColumn('eventsJson', 'json', col => col.notNull())
    .addColumn('decisionJson', 'json', col => col.notNull())
    .addColumn('ncId', 'varchar(255)', col => col.notNull())
    .addColumn('type', 'varchar(255)', col => col.notNull())
    .addColumn('createdDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('updatedDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<VerificationDatabase>): Promise<void> {
  await db.schema.dropTable(verifierRecordsTable).execute();
}

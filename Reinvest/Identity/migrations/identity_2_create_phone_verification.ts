import { IdentityDatabase, phoneVerificationTable } from 'Identity/Adapter/Database/IdentityDatabaseAdapter';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<IdentityDatabase>): Promise<void> {
  await db.schema
    .createTable(phoneVerificationTable)
    .addColumn('userId', 'uuid', col => col.primaryKey().notNull().unique())
    .addColumn('countryCode', 'varchar(4)', col => col.notNull())
    .addColumn('phoneNumber', 'varchar(20)', col => col.notNull())
    .addColumn('topt', 'varchar(6)', col => col.unique())
    .addColumn('tries', 'int8', col => col.notNull())
    .addColumn('createdAt', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('expiresAfterMinutes', 'int8', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<IdentityDatabase>): Promise<void> {
  await db.schema.dropTable(phoneVerificationTable).execute();
}

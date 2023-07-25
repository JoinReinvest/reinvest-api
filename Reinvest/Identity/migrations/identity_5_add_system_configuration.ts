import { IdentityDatabase } from 'Identity/Adapter/Database/IdentityDatabaseAdapter';
import { Kysely } from 'kysely';

export async function up(db: Kysely<IdentityDatabase>): Promise<void> {
  await db.schema
    .createTable('system_configuration')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('key', 'varchar(255)', col => col.unique().notNull())
    .addColumn('value', 'text', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<IdentityDatabase>): Promise<void> {
  await db.schema.dropTable('system_configuration').execute();
}

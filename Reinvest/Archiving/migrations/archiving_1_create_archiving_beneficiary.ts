import { archivingBeneficiary, ArchivingDatabase } from 'Archiving/Adapter/Database/DatabaseAdapter';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<ArchivingDatabase>): Promise<void> {
  await db.schema
    .createTable(archivingBeneficiary)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('accountId', 'uuid', col => col.notNull())
    .addColumn('parentId', 'uuid', col => col.notNull())
    .addColumn('label', 'varchar(64)', col => col.notNull())
    .addColumn('status', 'varchar(32)', col => col.notNull())
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('dateCompleted', 'timestamp', col => col.defaultTo(null))
    .addColumn('vertaloConfigurationJson', 'json', col => col.defaultTo(null))
    .addColumn('accountArchivingStateJson', 'json', col => col.defaultTo(null))
    .execute();

  await db.schema.alterTable(archivingBeneficiary).addUniqueConstraint('unique_profile_account', ['profileId', 'accountId']).execute();
}

export async function down(db: Kysely<ArchivingDatabase>): Promise<void> {
  await db.schema.alterTable(archivingBeneficiary).dropConstraint('unique_profile_account').execute();
  await db.schema.dropTable(archivingBeneficiary).execute();
}

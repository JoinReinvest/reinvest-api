import { Kysely, sql } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { registrationBankAccountTable } from 'Registration/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .createTable(registrationBankAccountTable)
    .addColumn('bankAccountId', 'uuid', col => col.primaryKey().notNull().unique())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('accountId', 'uuid', col => col.notNull())
    .addColumn('northCapitalId', 'varchar(36)', col => col.notNull())
    .addColumn('bankAccountNumber', 'varchar(255)', col => col.defaultTo(null))
    .addColumn('bankAccountType', 'varchar(255)', col => col.defaultTo(null))
    .addColumn('plaidUrl', 'text', col => col.defaultTo(null))
    .addColumn('state', 'varchar(36)', col => col.notNull())
    .addColumn('createdDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('plaidJson', 'json', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.dropTable(registrationBankAccountTable).execute();
}

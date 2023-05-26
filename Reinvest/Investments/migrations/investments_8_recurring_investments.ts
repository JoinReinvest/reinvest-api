import { recurringInvestmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely, sql } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .createTable(recurringInvestmentsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('accountId', 'uuid', col => col.notNull())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('portfolioId', 'uuid', col => col.notNull())
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('subscriptionAgreementId', 'uuid', col => col.defaultTo(null))
    .addColumn('amount', 'integer', col => col.notNull())
    .addColumn('startDate', 'varchar(36)', col => col.notNull())
    .addColumn('frequency', 'varchar(36)', col => col.notNull())
    .addColumn('status', 'varchar(36)', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.dropTable(recurringInvestmentsTable).execute();
}

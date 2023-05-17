import { investmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely, sql } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .createTable(investmentsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('accountId', 'uuid', col => col.notNull())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('dateUpdated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('subscriptionAgreementId', 'uuid', col => col.defaultTo(null))
    .addColumn('amount', 'integer', col => col.notNull())
    .addColumn('scheduledBy', 'varchar(36)', col => col.notNull()) // DIRECT/SCHEDULER
    .addColumn('recurringInvestmentId', 'uuid', col => col.defaultTo(null))
    .addColumn('status', 'varchar(36)', col => col.notNull()) // graphql type InvestmentStatus
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.dropTable(investmentsTable).execute();
}

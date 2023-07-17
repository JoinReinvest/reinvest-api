import { recurringInvestmentsExecutionTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely, sql } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .createTable(recurringInvestmentsExecutionTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('recurringInvestmentId', 'uuid', col => col.notNull())
    .addColumn('investmentId', 'uuid', col => col.notNull().unique())
    .addColumn('executionDate', 'timestamp', col => col.notNull())
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('investmentStatus', 'varchar(36)', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.dropTable(recurringInvestmentsExecutionTable).execute();
}

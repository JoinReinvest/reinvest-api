import { investmentsFeesTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely, sql } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .createTable(investmentsFeesTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('accountId', 'uuid', col => col.notNull())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('investmentId', 'uuid', col => col.notNull())
    .addColumn('verificationFeeId', 'uuid', col => col.notNull())
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('amount', 'integer', col => col.notNull())
    .addColumn('approveDate', 'timestamp', col => col.defaultTo(null))
    .addColumn('approvedByIP', 'varchar(36)', col => col.notNull())
    .addColumn('status', 'varchar(36)', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.dropTable(investmentsFeesTable).execute();
}

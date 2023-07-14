import { Kysely } from 'kysely';
import { PortfolioDatabase, portfolioTable } from 'Portfolio/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<PortfolioDatabase>): Promise<void> {
  await db.schema
    .createTable(portfolioTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('name', 'varchar(255)', col => col.notNull())
    .addColumn('northCapitalOfferingId', 'varchar(255)', col => col.notNull())
    .addColumn('offeringName', 'varchar(255)', col => col.notNull())
    .addColumn('vertaloAllocationId', 'varchar(255)', col => col.notNull())
    .addColumn('assetName', 'varchar(255)', col => col.notNull())
    .addColumn('linkToOfferingCircular', 'varchar(512)', col => col.notNull())
    .addColumn('status', 'varchar(36)', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<PortfolioDatabase>): Promise<void> {
  await db.schema.dropTable(portfolioTable).execute();
}

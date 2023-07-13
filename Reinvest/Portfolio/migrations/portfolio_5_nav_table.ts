import { Kysely, sql } from 'kysely';
import { navTable, PortfolioDatabase } from 'Portfolio/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<PortfolioDatabase>): Promise<void> {
  await db.schema
    .createTable(navTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('portfolioId', 'uuid', col => col.notNull())
    .addColumn('numberOfShares', 'int8', col => col.notNull())
    .addColumn('unitPrice', 'int8', col => col.notNull())
    .addColumn('dateSynchronization', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<PortfolioDatabase>): Promise<void> {
  await db.schema.dropTable(navTable).execute();
}

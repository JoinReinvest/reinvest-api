import { Kysely, sql } from "kysely";
import { PortfolioDatabase, unitPriceTable } from "Portfolio/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<PortfolioDatabase>): Promise<void> {
  await db.schema
    .createTable(unitPriceTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('portfolioId', 'uuid', col => col.notNull())
    .addColumn('unitPrice', 'int8', col => col.notNull())
    .addColumn('numberOfSharesInOffering', 'float8', col => col.notNull())
    .addColumn('dateSynchronization', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<PortfolioDatabase>): Promise<void> {
  await db.schema.dropTable(unitPriceTable).execute();
}

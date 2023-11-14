import { Kysely } from "kysely";
import { navTable, PortfolioDatabase } from "Portfolio/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<PortfolioDatabase>): Promise<void> {
  await db.schema
    .alterTable(navTable)
    .renameColumn('unitPrice', 'unitNav')
    .execute();

  await db.schema
    .alterTable(navTable)
    .renameColumn('dateSynchronization', 'dateUpdated')
    .execute();
}

export async function down(db: Kysely<PortfolioDatabase>): Promise<void> {
  await db.schema
    .alterTable(navTable)
    .renameColumn('unitNav', 'unitPrice')
    .execute();

  await db.schema
    .alterTable(navTable)
    .renameColumn('dateUpdated', 'dateSynchronization')
    .execute();
}

import { Kysely, sql } from 'kysely';
import { PortfolioDatabase, propertyTable } from 'Portfolio/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<PortfolioDatabase>): Promise<void> {
  await db.schema.alterTable(propertyTable).dropColumn('id').execute();

  await db.schema
    .alterTable(propertyTable)
    .addColumn('id', 'integer', col => col.primaryKey())
    .execute();
}

export async function down(db: Kysely<PortfolioDatabase>): Promise<void> {
  await db.schema.alterTable(propertyTable).dropColumn('id').execute();

  await db.schema
    .alterTable(propertyTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .execute();
}

import { Kysely } from 'kysely';
import { sadSharesTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .alterTable(sadSharesTable)
    .addColumn('transferredFrom', 'uuid', col => col.defaultTo(null))
    .addColumn('origin', 'varchar(36)', col => col.defaultTo('INVESTMENT'))
    .execute();

  await db.schema.alterTable(sadSharesTable).dropConstraint('shares_unique_investment_id').execute();
  await db.schema.alterTable(sadSharesTable).renameColumn('investmentId', 'originId').execute();
  await db.schema.alterTable(sadSharesTable).addUniqueConstraint('shares_unique_origin_id', ['originId']).execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.alterTable(sadSharesTable).dropConstraint('shares_unique_origin_id').execute();
  await db.schema.alterTable(sadSharesTable).renameColumn('originId', 'investmentId').execute();
  await db.schema.alterTable(sadSharesTable).addUniqueConstraint('shares_unique_investment_id', ['investmentId']).execute();
  await db.schema.alterTable(sadSharesTable).dropColumn('transferredFrom').dropColumn('origin').execute();
}

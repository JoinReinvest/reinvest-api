import { Kysely, sql } from 'kysely';
import { sadCalculatedDividendsTable, sadSharesTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .alterTable(sadCalculatedDividendsTable)
    .addColumn('numberOfDaysInvestorOwnsShares', 'integer', col => col.notNull())
    .execute();
  await db.schema.alterTable(sadCalculatedDividendsTable).addUniqueConstraint('sad_calculated_dividends_unique', ['declarationId', 'sharesId']).execute();
  await db.schema
    .alterTable(sadSharesTable)
    .addColumn('dateFunding', 'timestamp', col => col.defaultTo(null))
    .execute();
  await db.schema.createIndex('sad_calculated_dividends_declaration_id').on(sadCalculatedDividendsTable).column('declarationId').execute();
  await db.schema.createIndex('sad_calculated_dividends_shares_id').on(sadCalculatedDividendsTable).column('sharesId').execute();

  await db
    .updateTable(sadSharesTable)
    // @ts-ignore
    .set({ dateFunding: sql`COALESCE("dateCreated")` })
    .where('status', '!=', <any>'CREATED')
    .execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.alterTable(sadCalculatedDividendsTable).dropColumn('numberOfDaysInvestorOwnsShares').execute();
  await db.schema.alterTable(sadSharesTable).dropColumn('dateFunding').execute();
  await db.schema.alterTable(sadCalculatedDividendsTable).dropConstraint('sad_calculated_dividends_unique').execute();
  await db.schema.dropIndex('sad_calculated_dividends_shares_id').execute();
  await db.schema.dropIndex('sad_calculated_dividends_declaration_id').execute();
}

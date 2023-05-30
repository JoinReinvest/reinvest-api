import { Kysely } from 'kysely';
import { sadSharesTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

/**
 * export interface SharesTable {
 *   id: string;
 *   profileId: string;
 *   accountId: string;
 *   investmentId: string;
 *   portfolioId: string;
 *   dateCreated: Date;
 *   dateFunded: Date | null;
 *   dateSettled: Date | null;
 *   dateRevoked: Date | null;
 *   numberOfShares: number;
 *   unitPrice: number;
 *   price: number;
 *   status: 'CREATED' | 'FUNDING' | 'FUNDED' | 'SETTLED' | 'REVOKED';
 * }
 */

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .alterTable(sadSharesTable)
    .alterColumn('numberOfShares', col => col.dropNotNull())
    .alterColumn('unitPrice', col => col.dropNotNull())
    .alterColumn('dateFunded', col => col.dropNotNull())
    .alterColumn('dateSettled', col => col.dropNotNull())
    .alterColumn('dateRevoked', col => col.dropNotNull())
    .execute();

  await db.schema.alterTable(sadSharesTable).addUniqueConstraint('shares_unique_investment_id', ['investmentId']).execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.alterTable(sadSharesTable).dropConstraint('shares_unique_investment_id').execute();
  await db.schema
    .alterTable(sadSharesTable)
    .alterColumn('numberOfShares', col => col.setNotNull())
    .alterColumn('unitPrice', col => col.setNotNull())
    .alterColumn('dateFunded', col => col.setNotNull())
    .alterColumn('dateSettled', col => col.setNotNull())
    .alterColumn('dateRevoked', col => col.setNotNull())
    .execute();
}

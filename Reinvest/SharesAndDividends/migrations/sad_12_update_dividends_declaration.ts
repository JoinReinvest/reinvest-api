import { Kysely } from 'kysely';
import { sadDividendsDeclarationsTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

/**
 * export interface DividendsDeclarationTable {
 *   calculatedFromDate: Date;
 *   calculatedToDate: Date;
 *   calculationFinishedDate: Date | null;
 *   createdDate: Date;
 *   id: string;
 *   numberOfDays: number;
 *   numberOfSharesJson: JSONObjectOf<NumberOfSharesPerDay>;
 *   portfolioId: string;
 *   status: 'CALCULATING' | 'CALCULATED';
 *   totalDividendAmount: number;
 *   unitAmountPerDay: number;
 * }
 */

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .alterTable(sadDividendsDeclarationsTable)
    .addColumn('calculationFinishedDate', 'timestamp', col => col.defaultTo(null))
    .dropColumn('unitAmountPerSharePerDay')
    .addColumn('unitAmountPerDay', 'integer', col => col.notNull())
    .dropColumn('numberOfShares')
    .addColumn('numberOfSharesJson', 'json', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .alterTable(sadDividendsDeclarationsTable)
    .dropColumn('calculationFinishedDate')
    .dropColumn('unitAmountPerDay')
    .dropColumn('numberOfSharesJson')
    .addColumn('unitAmountPerSharePerDay', 'integer', col => col.notNull())
    .addColumn('numberOfShares', 'float8', col => col.notNull())
    .execute();
}

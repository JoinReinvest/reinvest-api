import { Kysely, sql } from 'kysely';
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
    .createTable(sadSharesTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('accountId', 'uuid', col => col.notNull())
    .addColumn('investmentId', 'uuid', col => col.notNull())
    .addColumn('portfolioId', 'uuid', col => col.notNull())
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('dateFunded', 'timestamp', col => col.notNull().defaultTo(null))
    .addColumn('dateSettled', 'timestamp', col => col.notNull().defaultTo(null))
    .addColumn('dateRevoked', 'timestamp', col => col.notNull().defaultTo(null))
    .addColumn('numberOfShares', 'float8', col => col.notNull())
    .addColumn('unitPrice', 'integer', col => col.notNull())
    .addColumn('price', 'integer', col => col.notNull())
    .addColumn('status', 'varchar(36)', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.dropTable(sadSharesTable).execute();
}

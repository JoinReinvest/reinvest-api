import { Kysely, sql } from "kysely";
import { VerificationDatabase, verificationFeesTable } from "Verification/Adapter/Database/DatabaseAdapter";

/**
 *   id: UUID;
 *   profileId: UUID;
 *   accountId: UUID;
 *   dateCreated: Date;
 *   amount: number;
 *   amountAssigned: number;
 *   decisionId: string;
 *   status: 'ASSIGNED' | 'NOT_ASSIGNED' | 'PARTIALLY_ASSIGNED';
 * @param db
 */
export async function up(db: Kysely<VerificationDatabase>): Promise<void> {
  await db.schema
    .createTable(verificationFeesTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('profileId', 'uuid', col => col.defaultTo(null))
    .addColumn('accountId', 'uuid', col => col.defaultTo(null))
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('amount', 'integer', col => col.notNull())
    .addColumn('amountAssigned', 'integer', col => col.notNull())
    .addColumn('decisionId', 'varchar(255)', col => col.notNull().unique())
    .addColumn('status', 'varchar(255)', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<VerificationDatabase>): Promise<void> {
  await db.schema.dropTable(verificationFeesTable).execute();
}

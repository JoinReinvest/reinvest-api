import { Kysely } from 'kysely';
import { VerificationDatabase, verifierRecordsTable } from 'Verification/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<VerificationDatabase>): Promise<void> {
  await db.schema
    .alterTable(verifierRecordsTable)
    .addColumn('accountId', 'uuid', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<VerificationDatabase>): Promise<void> {
  await db.schema.alterTable(verifierRecordsTable).dropColumn('accountId').execute();
}

import { Kysely } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { VerificationDatabase, verifierRecordsTable } from 'Verification/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<VerificationDatabase>): Promise<void> {
  await db.schema
    .alterTable(verifierRecordsTable)
    .addColumn('accountId', 'uuid', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.alterTable(verifierRecordsTable).dropColumn('accountId').execute();
}

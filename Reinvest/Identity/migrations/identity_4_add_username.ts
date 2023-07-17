import { IdentityDatabase, userTable } from 'Identity/Adapter/Database/IdentityDatabaseAdapter';
import { Kysely } from 'kysely';
import { legalEntitiesProfileTable } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<IdentityDatabase>): Promise<void> {
  await db.schema
    .alterTable(userTable)
    .addColumn('label', 'varchar(255)', col => col.defaultTo('Investor'))
    .execute();

  await updateLabels(db);
}

export async function down(db: Kysely<IdentityDatabase>): Promise<void> {
  await db.schema.alterTable(userTable).dropColumn('label').execute();
}

async function updateLabels(db: Kysely<any>) {
  const labels = await db.selectFrom(legalEntitiesProfileTable).select(['profileId', 'label']).execute();

  for (const { label, profileId } of labels) {
    await db.updateTable(userTable).set({ label }).where('profileId', '=', profileId).execute();
  }
}

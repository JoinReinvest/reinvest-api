import { IdentityDatabase, userTable } from 'Identity/Adapter/Database/IdentityDatabaseAdapter';
import { Kysely } from 'kysely';

export async function up(db: Kysely<IdentityDatabase>): Promise<void> {
  await db.schema
    .alterTable(userTable)
    .addColumn('bannedIdsJson', 'json', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<IdentityDatabase>): Promise<void> {
  await db.schema.alterTable(userTable).dropColumn('bannedIdsJson').execute();
}

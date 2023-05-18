import { subscriptionAgreementTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely, sql } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .createTable(subscriptionAgreementTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('accountId', 'uuid', col => col.notNull())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('investmentId', 'uuid', col => col.defaultTo(null))
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('status', 'varchar(36)', col => col.defaultTo(null))
    .addColumn('signedByIP', 'varchar(36)', col => col.defaultTo(null))
    .addColumn('signedAt', 'timestamp', col => col.defaultTo(null))
    .addColumn('pdfDateCreated', 'timestamp', col => col.defaultTo(null))
    .addColumn('agreementType', 'varchar(36)', col => col.defaultTo(null))
    .addColumn('contentFieldsJson', 'json', col => col.notNull())
    .addColumn('templateVersion', 'integer', col => col.defaultTo(1))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.dropTable(subscriptionAgreementTable).execute();
}

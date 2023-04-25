import { DocumentsDatabase } from 'Documents/Adapter/Database/DatabaseAdapter';
import { InvestmentAccountsDatabase } from 'InvestmentAccounts/Infrastructure/Storage/DatabaseAdapter';
import { Kysely } from 'kysely';

export async function up(db: Kysely<DocumentsDatabase>): Promise<void> {
  await db.schema
    .createTable('documents_templates')
    // .addColumn('aggregateId', 'varchar(36)', col => col.primaryKey().notNull().unique())
    // .addColumn('dateCreated', 'date', col => col.notNull())
    // .addColumn('version', 'int8', col => col.notNull())
    // .addColumn('previousVersion', 'int8', col => col.notNull())
    // .addColumn('kind', 'varchar(36)', col => col.notNull())
    // .addColumn('state', 'json')
    .execute();
}

export async function down(db: Kysely<DocumentsDatabase>): Promise<void> {
  await db.schema.dropTable('legal_entities_people').execute();
}

import {Kysely, sql} from 'kysely';
import {
    LegalEntitiesDatabase, legalEntitiesCompanyAccountTable,
} from "LegalEntities/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema
        .createTable(legalEntitiesCompanyAccountTable)
        .addColumn('accountId', 'uuid', col => col.primaryKey().notNull().unique())
        .addColumn('profileId', 'uuid', col => col.notNull())
        .addColumn('companyName', 'json', col => col.defaultTo(null))
        .addColumn('address', 'json', col => col.defaultTo(null))
        .addColumn('ein', 'json', col => col.defaultTo(null))
        .addColumn('annualRevenue', 'json', col => col.defaultTo(null))
        .addColumn('numberOfEmployees', 'json', col => col.defaultTo(null))
        .addColumn('industry', 'json', col => col.defaultTo(null))
        .addColumn('companyType', 'json', col => col.defaultTo(null))
        .addColumn('stakeholders', 'json', col => col.defaultTo(null))
        .addColumn('companyDocuments', 'json', col => col.defaultTo(null))
        .addColumn('accountType', 'varchar(36)')
        .addColumn('avatar', 'json', col => col.defaultTo(null))
        .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
        .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema.dropTable(legalEntitiesCompanyAccountTable).execute();
}

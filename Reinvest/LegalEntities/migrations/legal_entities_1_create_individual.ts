import {Kysely} from 'kysely';
import {InvestmentAccountsDatabase} from "InvestmentAccounts/Storage/DatabaseAdapter";
import {LegalEntitiesDatabase} from "LegalEntities/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema
        .createTable('legal_entities_people')
        // .addColumn('aggregateId', 'varchar(36)', col => col.primaryKey().notNull().unique())
        // .addColumn('dateCreated', 'date', col => col.notNull())
        // .addColumn('version', 'int8', col => col.notNull())
        // .addColumn('previousVersion', 'int8', col => col.notNull())
        // .addColumn('kind', 'varchar(36)', col => col.notNull())
        // .addColumn('state', 'json')
        .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema.dropTable('legal_entities_people').execute();
}

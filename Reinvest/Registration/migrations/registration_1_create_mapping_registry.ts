import {Kysely, sql} from 'kysely';
import {LegalEntitiesDatabase} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {RegistrationMappingRegistryTable} from "Registration/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema
        .createTable(RegistrationMappingRegistryTable)
        .addColumn('recordId', 'uuid', col => col.primaryKey().notNull().unique())
        .addColumn('profileId', 'uuid', col => col.notNull())
        .addColumn('externalId', 'uuid', col => col.notNull().unique())
        .addColumn('mappedType', 'varchar(10)', col => col.notNull())
        .addColumn('email', 'varchar(255)', col => col.defaultTo(null))

        .addColumn('status', 'varchar(10)', col => col.notNull().defaultTo('DIRTY'))
        .addColumn('version', 'integer', col => col.defaultTo(0))
        .addColumn('createdDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
        .addColumn('updatedDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
        .addColumn('lockedUntil', 'timestamp', col => col.defaultTo(null))
        .execute();

    await db.schema.createIndex('registration_index').on(RegistrationMappingRegistryTable).columns(['profileId', 'externalId']).execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema.dropIndex('registration_index').execute();
    await db.schema.dropTable(RegistrationMappingRegistryTable).execute();
}

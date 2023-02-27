import {Kysely, sql} from 'kysely';
import {LegalEntitiesDatabase} from "LegalEntities/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    // await db.schema
    //     .createTable('legal_entities_person')
    //     .addColumn('person_id', 'uuid', col => col.primaryKey().notNull().unique())
    //     .addColumn('date_created', 'timestamp', col => col.notNull())
    //     .addColumn('name', 'json', col => col.notNull())
    //     .addColumn('dob', 'json', col => col.notNull())
    //     .addColumn('address', 'json', col => col.notNull())
    //     .addColumn('id_scans_ids', 'json', col => col.notNull())
    //     .addColumn('domicile', 'json', col => col.notNull())
    //     .addColumn('ssn', 'json', col => col.notNull())
    //     .addColumn('is_completed', 'boolean', col => col.notNull())
    //     .execute();

    await db.schema
        .createTable('legal_entities_profile')
        .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
        .addColumn('profileId', 'uuid', col => col.primaryKey().notNull().unique())
        .addColumn('externalId', 'varchar(36)', col => col.notNull().unique())
        .addColumn('label', 'varchar(36)', col => col.notNull())
        .addColumn('name', 'json', col => col.defaultTo(null))
        .addColumn('ssn', 'json', col => col.defaultTo(null))
        .addColumn('dateOfBirth', 'json', col => col.defaultTo(null))
        .addColumn('address', 'json', col => col.defaultTo(null))
        .addColumn('idScan', 'json', col => col.defaultTo(null))
        .addColumn('avatar', 'json', col => col.defaultTo(null))
        .addColumn('domicile', 'json', col => col.defaultTo(null))
        .addColumn('statements', 'json', col => col.defaultTo(null))
        .addColumn('isCompleted', 'boolean', col => col.defaultTo(false))
        .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema.dropTable('legal_entities_profile').execute();
    // await db.schema.dropTable('legal_entities_person').execute();
}

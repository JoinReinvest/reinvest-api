import {Kysely, sql} from 'kysely';
import {LegalEntitiesDatabase} from "LegalEntities/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema
        .createTable('legal_entities_person')
        .addColumn('person_id', 'uuid', col => col.primaryKey().notNull().unique())
        .addColumn('date_created', 'timestamp', col => col.notNull())
        .addColumn('name', 'json', col => col.notNull())
        .addColumn('dob', 'json', col => col.notNull())
        .addColumn('address', 'json', col => col.notNull())
        .addColumn('id_scans_ids', 'json', col => col.notNull())
        .addColumn('domicile', 'json', col => col.notNull())
        .addColumn('ssn', 'json', col => col.notNull())
        .addColumn('is_completed', 'boolean', col => col.notNull())
        .execute();

    await db.schema
        .createTable('legal_entities_profile')
        .addColumn('profile_id', 'uuid', col => col.primaryKey().notNull().unique())
        .addColumn('external_id', 'varchar(36)', col => col.notNull().unique())
        .addColumn('date_created', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
        .addColumn('label', 'varchar(36)', col => col.notNull())
        .addColumn('avatar_id', 'varchar(255)', col => col.defaultTo(null))
        .addColumn('statements', 'json', col => col.defaultTo(null))
        .addColumn('name', 'json', col => col.defaultTo(null))
        .addColumn('dob', 'json', col => col.defaultTo(null))
        .addColumn('address', 'json', col => col.defaultTo(null))
        .addColumn('id_scans_ids', 'json', col => col.defaultTo(null))
        .addColumn('domicile', 'json', col => col.defaultTo(null))
        .addColumn('ssn', 'json', col => col.defaultTo(null))
        .addColumn('is_completed', 'boolean', col => col.defaultTo(false))
        .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema.dropTable('legal_entities_profile').execute();
    await db.schema.dropTable('legal_entities_person').execute();
}

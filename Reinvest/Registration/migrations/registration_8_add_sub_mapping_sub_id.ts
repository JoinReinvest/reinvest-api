import {Kysely} from 'kysely';
import {LegalEntitiesDatabase} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {RegistrationDatabase, registrationMappingRegistryTable} from "Registration/Adapter/Database/DatabaseAdapter";
import {EMPTY_UUID} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";

export async function up(db: Kysely<RegistrationDatabase>): Promise<void> {
    await db.schema
        .alterTable(registrationMappingRegistryTable)
        .dropConstraint('profile_external_ids_unique')
        .execute();

    await db.schema
        .alterTable(registrationMappingRegistryTable)
        .dropConstraint('registration_mapping_registry_externalId_key')
        .execute();

    await db.schema
        .alterTable(registrationMappingRegistryTable)
        .addColumn('dependentId', 'uuid')
        .execute();

    await db
        .updateTable(registrationMappingRegistryTable)
        .set({dependentId: EMPTY_UUID})
        .execute();

    await db.schema
        .alterTable(registrationMappingRegistryTable)
        .addUniqueConstraint('profile_external_ids_unique', ['profileId', 'externalId', 'dependentId'])
        .execute();

    await db.schema
        .alterTable(registrationMappingRegistryTable)
        .alterColumn('dependentId', col => col.setNotNull())
        .execute();

}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema
        .alterTable(registrationMappingRegistryTable)
        .dropConstraint('profile_external_ids_unique')
        .execute();

    await db.schema
        .alterTable(registrationMappingRegistryTable)
        .dropColumn('dependentId')
        .execute();

    await db.schema
        .alterTable(registrationMappingRegistryTable)
        .addUniqueConstraint('registration_mapping_registry_externalId_key', ['externalId'])
        .execute();

    await db.schema
        .alterTable(registrationMappingRegistryTable)
        .addUniqueConstraint('profile_external_ids_unique', ['profileId', 'externalId'])
        .execute();
}

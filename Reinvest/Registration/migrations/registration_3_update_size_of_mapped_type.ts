import { Kysely } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { registrationMappingRegistryTable } from 'Registration/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .alterTable(registrationMappingRegistryTable)
    .alterColumn('mappedType', col => col.setDataType('varchar(32)'))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {}

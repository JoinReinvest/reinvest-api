import {Kysely, sql} from 'kysely';
import {LegalEntitiesDatabase} from "LegalEntities/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {

    await db.schema
        .alterTable('legal_entities_profile')
        .addColumn('investingExperience', 'json', col => col.defaultTo(null))
        .execute();

}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    await db.schema.alterTable('legal_entities_profile').dropColumn('investingExperience').execute();
}

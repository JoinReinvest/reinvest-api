import {Kysely, sql} from 'kysely';
import {LegalEntitiesDatabase} from "LegalEntities/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    const documents = await getProfileDocuments(db);
    const migratedDocuments = documents.map((document) => {
        const {path} = document.idScan;
        return {
            profileId: document.profileId,
            idScan: document.idScan.ids.map((id: string) => ({
                id,
                fileName: 'filename.pdf',
                path,
            })),
        };
    });

    for (const document of migratedDocuments) {
        await db
            .updateTable('legal_entities_profile')
            .set({idScan: JSON.stringify(document.idScan)})
            .where('profileId', '=', document.profileId)
            .execute();
    }
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
    const documents = await getProfileDocuments(db);
    const migratedDocuments = documents.map((document) => {
        let path = document.profileId;
        const ids = document.idScan.map((document: { id: string }) => document.id);

        return {
            profileId: document.profileId,
            idScan: {ids, path}
        };
    });

    for (const document of migratedDocuments) {
        await db
            .updateTable('legal_entities_profile')
            .set({idScan: JSON.stringify(document.idScan)})
            .where('profileId', '=', document.profileId)
            .execute();
    }
}

async function getProfileDocuments(db: Kysely<LegalEntitiesDatabase>): Promise<{ profileId: string, idScan: any }[]> {
    const data = await db
        .selectFrom('legal_entities_profile')
        .select(['profileId', 'idScan'])
        .where('idScan', 'is not', null)
        .execute();

    return data;
}

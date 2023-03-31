import {
    RegistrationDatabaseAdapterProvider,
    vertaloSynchronizationTable
} from "Registration/Adapter/Database/DatabaseAdapter";
import {IdGeneratorInterface} from "IdGenerator/IdGenerator";
import {
    VertaloEntityType, VertaloIds,
    VertaloSynchronizationRecordType
} from "Registration/Domain/VendorModel/Vertalo/VertaloTypes";
import {
    InsertableVertaloSynchronization,
    SelectableVertaloSynchronizationRecord
} from "Registration/Adapter/Database/RegistrationSchema";
import {VertaloSynchronizationRecord} from "Registration/Adapter/Vertalo/VertaloSynchronizationRecord";

export class VertaloSynchronizationRepository {
    public static getClassName = (): string => "VertaloSynchronizationRepository";
    private databaseAdapterProvider: RegistrationDatabaseAdapterProvider;

    private idGenerator: IdGeneratorInterface;

    constructor(databaseAdapterProvider: RegistrationDatabaseAdapterProvider, uniqueGenerator: IdGeneratorInterface) {
        this.databaseAdapterProvider = databaseAdapterProvider;
        this.idGenerator = uniqueGenerator;
    }

    async getSynchronizationRecord(recordId: string): Promise<VertaloSynchronizationRecord | null> {
        try {
            const data = await this.databaseAdapterProvider.provide()
                .selectFrom(vertaloSynchronizationTable)
                .select(['recordId', 'vertaloIds', 'type', 'crc', 'documents', 'version'])
                .where('recordId', '=', recordId)
                .limit(1)
                .castTo<SelectableVertaloSynchronizationRecord>()
                .castTo<VertaloSynchronizationRecordType>()
                .executeTakeFirstOrThrow();

            return VertaloSynchronizationRecord.create(data);
        } catch (error: any) {
            return null;
        }
    }

    async createSynchronizationRecord(recordId: string, vertaloIds: VertaloIds, crc: string, entityType: VertaloEntityType): Promise<void> {
        await this.databaseAdapterProvider.provide()
            .insertInto(vertaloSynchronizationTable)
            .values(<InsertableVertaloSynchronization>{
                recordId,
                vertaloIds: JSON.stringify(vertaloIds),
                crc,
                type: entityType,
                documents: JSON.stringify([]),
                version: 0,
            })
            .onConflict((oc) => oc
                .columns(['recordId'])
                .doNothing()
            )
            .execute()
    }

    async updateSynchronizationRecord(synchronizationRecord: VertaloSynchronizationRecord): Promise<void> {
        if (!synchronizationRecord.wasUpdated()) {
            return;
        }
        const updatedDate = new Date();
        const nextVersion = synchronizationRecord.getNextVersion();
        const currentVersion = synchronizationRecord.getVersion();

        try {
            await this.databaseAdapterProvider.provide()
                .updateTable(vertaloSynchronizationTable)
                .set({
                    version: nextVersion,
                    crc: synchronizationRecord.getCrc(),
                    updatedDate,
                })
                .where('recordId', '=', synchronizationRecord.getRecordId())
                .where('version', '=', currentVersion)
                .returning(['version'])
                .executeTakeFirstOrThrow();
        } catch (error: any) {
            console.warn(`Vertalo Synchronization Record race condition detected for record ${synchronizationRecord.getRecordId()}`);
        }
    }

}
import {IdGeneratorInterface} from "IdGenerator/IdGenerator";
import {
    northCapitalSynchronizationTable,
    RegistrationDatabaseAdapterProvider,
} from "Registration/Adapter/Database/DatabaseAdapter";
import {
    NorthCapitalEntityType,
    NorthCapitalSynchronizationRecord,
    NorthCapitalSynchronizationRecordType
} from "Registration/Adapter/NorthCapital/NorthCapitalSynchronizationRecord";
import {
    InsertableNorthCapitalSynchronization,
    SelectableSynchronizationRecord
} from "Registration/Adapter/Database/RegistrationSchema";

export class NorthCapitalSynchronizationRepository {
    public static getClassName = (): string => "NorthCapitalSynchronizationRepository";
    private databaseAdapterProvider: RegistrationDatabaseAdapterProvider;

    private idGenerator: IdGeneratorInterface;

    constructor(databaseAdapterProvider: RegistrationDatabaseAdapterProvider, uniqueGenerator: IdGeneratorInterface) {
        this.databaseAdapterProvider = databaseAdapterProvider;
        this.idGenerator = uniqueGenerator;
    }

    async getSynchronizationRecord(recordId: string): Promise<NorthCapitalSynchronizationRecord | never> {
        const data = await this.databaseAdapterProvider.provide()
            .selectFrom(northCapitalSynchronizationTable)
            .select(['recordId', 'northCapitalId', 'type', 'crc', 'documents', 'version'])
            .where('recordId', '=', recordId)
            .limit(1)
            .executeTakeFirstOrThrow() as SelectableSynchronizationRecord as NorthCapitalSynchronizationRecordType;

        return NorthCapitalSynchronizationRecord.create(data);
    }

    async createSynchronizationRecord(recordId: string, partyId: string, crc: string, entityType: NorthCapitalEntityType): Promise<void> {
        await this.databaseAdapterProvider.provide()
            .insertInto(northCapitalSynchronizationTable)
            .values(<InsertableNorthCapitalSynchronization>{
                recordId,
                northCapitalId: partyId,
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

    async updateSynchronizationRecord(synchronizationRecord: NorthCapitalSynchronizationRecord, crc: string): Promise<void> {
        const updatedDate = new Date();
        const nextVersion = synchronizationRecord.getNextVersion();
        const currentVersion = synchronizationRecord.getVersion();

        try {
            await this.databaseAdapterProvider.provide()
                .updateTable(northCapitalSynchronizationTable)
                .set({
                    version: nextVersion,
                    crc,
                    updatedDate
                })
                .where('recordId', '=', synchronizationRecord.getRecordId())
                .where('version', '=', currentVersion)
                .returning(['version'])
                .executeTakeFirstOrThrow();
        } catch (error: any) {
            console.warn(`North Capital Synchronization Record race condition detected for record ${synchronizationRecord.getRecordId()}`);
        }
    }
}
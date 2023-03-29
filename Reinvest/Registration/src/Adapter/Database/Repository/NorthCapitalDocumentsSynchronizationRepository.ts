import {IdGeneratorInterface} from "IdGenerator/IdGenerator";
import {
    northCapitalDocumentsSynchronizationTable,
    northCapitalSynchronizationTable,
    RegistrationDatabaseAdapterProvider, registrationMappingRegistryTable,
} from "Registration/Adapter/Database/DatabaseAdapter";
import {
    NorthCapitalSynchronizationRecord,
    NorthCapitalSynchronizationRecordType
} from "Registration/Adapter/NorthCapital/NorthCapitalSynchronizationRecord";
import {
    InsertableNorthCapitalSynchronization, SelectablePartyId,
    SelectableNorthCapitalSynchronizationRecord, InsertableNorthCapitalDocumentsSynchronization
} from "Registration/Adapter/Database/RegistrationSchema";
import {MappedType} from "Registration/Domain/Model/Mapping/MappedType";
import {
    NorthCapitalObjectType,
    NorthCapitalSynchronizationMapping
} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes";
import {DocumentSchema} from "Registration/Domain/Model/ReinvestTypes";

export class NorthCapitalDocumentsSynchronizationRepository {
    public static getClassName = (): string => "NorthCapitalDocumentsSynchronizationRepository";
    private databaseAdapterProvider: RegistrationDatabaseAdapterProvider;

    private idGenerator: IdGeneratorInterface;

    constructor(databaseAdapterProvider: RegistrationDatabaseAdapterProvider, uniqueGenerator: IdGeneratorInterface) {
        this.databaseAdapterProvider = databaseAdapterProvider;
        this.idGenerator = uniqueGenerator;
    }

    // async getSynchronizationRecord(recordId: string): Promise<NorthCapitalSynchronizationRecord | null> {
    //     try {
    //         const data = await this.databaseAdapterProvider.provide()
    //             .selectFrom(northCapitalSynchronizationTable)
    //             .select(['recordId', 'northCapitalId', 'type', 'crc', 'documents', 'version', 'links'])
    //             .where('recordId', '=', recordId)
    //             .limit(1)
    //             .executeTakeFirstOrThrow() as SelectableNorthCapitalSynchronizationRecord as NorthCapitalSynchronizationRecordType;
    //
    //         return NorthCapitalSynchronizationRecord.create(data);
    //     } catch (error: any) {
    //         return null;
    //     }
    // }

    async addDocuments(recordId: string, northCapitalId: string, northCapitalType: NorthCapitalObjectType, documents: DocumentSchema[]): Promise<void> {
        const values = documents.map((document: DocumentSchema) => (<InsertableNorthCapitalDocumentsSynchronization>{
            id: this.idGenerator.createUuid(),
            recordId,
            northCapitalId,
            northCapitalType,
            documentId: document.id,
            documentPath: document.path,
            documentFilename: document.fileName,
            version: 0,
            state: 'DIRTY',
            createdDate: new Date(),
            updatedDate: new Date(),
        }));

        await this.databaseAdapterProvider.provide()
            .insertInto(northCapitalDocumentsSynchronizationTable)
            .values(values)
            .onConflict((oc) => oc
                .columns(['documentId'])
                .doNothing()
            )
            .execute()
    }

    // async updateSynchronizationRecord(synchronizationRecord: NorthCapitalSynchronizationRecord): Promise<void> {
    //     if (!synchronizationRecord.wasUpdated()) {
    //         return;
    //     }
    //     const updatedDate = new Date();
    //     const nextVersion = synchronizationRecord.getNextVersion();
    //     const currentVersion = synchronizationRecord.getVersion();
    //
    //     try {
    //         await this.databaseAdapterProvider.provide()
    //             .updateTable(northCapitalSynchronizationTable)
    //             .set({
    //                 version: nextVersion,
    //                 crc: synchronizationRecord.getCrc(),
    //                 updatedDate,
    //                 links: JSON.stringify(synchronizationRecord.getLinks()),
    //             })
    //             .where('recordId', '=', synchronizationRecord.getRecordId())
    //             .where('version', '=', currentVersion)
    //             .returning(['version'])
    //             .executeTakeFirstOrThrow();
    //     } catch (error: any) {
    //         console.warn(`North Capital Synchronization Record race condition detected for record ${synchronizationRecord.getRecordId()}`);
    //     }
    // }
    //
    // async getMainPartyIdByProfile(profileId: string): Promise<string | never> {
    //     try {
    //         const data = await this.databaseAdapterProvider.provide()
    //             .selectFrom(registrationMappingRegistryTable)
    //             .fullJoin(northCapitalSynchronizationTable, `${northCapitalSynchronizationTable}.recordId`, `${registrationMappingRegistryTable}.recordId`)
    //             .select([`${northCapitalSynchronizationTable}.northCapitalId`])
    //             .where(`${registrationMappingRegistryTable}.profileId`, '=', profileId)
    //             .where(`${registrationMappingRegistryTable}.externalId`, '=', profileId)
    //             .where(`${registrationMappingRegistryTable}.mappedType`, '=', MappedType.PROFILE)
    //             .limit(1)
    //             .castTo<SelectablePartyId>()
    //             .executeTakeFirstOrThrow();
    //
    //         return data.northCapitalId;
    //     } catch (error: any) {
    //         throw new Error('MAIN_PARTY_NOT_FOUND');
    //     }
    // }
    //
    // async getAllProfileSynchronizationMapping(recordId: string): Promise<NorthCapitalSynchronizationMapping[]> {
    //     const {profileId} = await this.databaseAdapterProvider.provide()
    //         .selectFrom(registrationMappingRegistryTable)
    //         .select(['profileId'])
    //         .where('recordId', '=', recordId)
    //         .limit(1)
    //         .executeTakeFirstOrThrow();
    //
    //     const data = await this.databaseAdapterProvider.provide()
    //         .selectFrom(registrationMappingRegistryTable)
    //         .fullJoin(northCapitalSynchronizationTable, `${northCapitalSynchronizationTable}.recordId`, `${registrationMappingRegistryTable}.recordId`)
    //         .select([`${northCapitalSynchronizationTable}.northCapitalId`])
    //         .select([`${registrationMappingRegistryTable}.profileId`, `${registrationMappingRegistryTable}.externalId`, `${registrationMappingRegistryTable}.mappedType`])
    //         .where(`${registrationMappingRegistryTable}.profileId`, '=', profileId)
    //         .execute();
    //
    //     return data.map((row: any) => {
    //         return {
    //             mapping: {
    //                 type: row.mappedType,
    //                 profileId: row.profileId,
    //                 externalId: row.externalId,
    //             },
    //             northCapitalId: row.northCapitalId,
    //         }
    //     });
    // }
}
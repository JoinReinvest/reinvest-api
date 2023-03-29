import {IdGeneratorInterface} from "IdGenerator/IdGenerator";
import {
    northCapitalDocumentsSynchronizationTable,
    RegistrationDatabaseAdapterProvider,
} from "Registration/Adapter/Database/DatabaseAdapter";
import {
    InsertableNorthCapitalDocumentsSynchronization
} from "Registration/Adapter/Database/RegistrationSchema";
import {
    NorthCapitalObjectType,
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

    async getDocumentIdsToSync(): Promise<string[]> {
        try {
            const data = await this.databaseAdapterProvider.provide()
                .selectFrom(northCapitalDocumentsSynchronizationTable)
                .select(['documentId'])
                .where('state', '=', 'DIRTY')
                .orWhere('state', '=', 'TO_BE_DELETED')
                .orderBy('updatedDate', 'asc')
                .limit(20)
                .execute();

            return data.map((row: any) => row.documentId);
        } catch (error: any) {
            console.log(error.message);
            return [];
        }

    }
}
import {IdGeneratorInterface} from "IdGenerator/IdGenerator";
import {
    RegistrationDatabaseAdapterProvider,
    RegistrationMappingRegistryTable
} from "Registration/Adapter/Database/DatabaseAdapter";
import {MappedType} from "Registration/Common/MappedType";
import {EmailCreator} from "Registration/Common/EmailCreator";

export class MappingRegistryRepository {
    public static getClassName = (): string => "MappingRegistryRepository";
    private databaseAdapterProvider: RegistrationDatabaseAdapterProvider;

    private idGenerator: IdGeneratorInterface;
    private emailCreator: EmailCreator;

    constructor(databaseAdapterProvider: RegistrationDatabaseAdapterProvider, uniqueGenerator: IdGeneratorInterface, emailCreator: EmailCreator) {
        this.databaseAdapterProvider = databaseAdapterProvider;
        this.idGenerator = uniqueGenerator;
        this.emailCreator = emailCreator;
    }

    async addRecord(profileId: string, externalId: string, mappedType: MappedType): Promise<void> {
        const email = this.emailCreator.create(profileId, externalId, mappedType);
        // overload the method
        // close connection
        await this.databaseAdapterProvider.provide()
            .insertInto(RegistrationMappingRegistryTable)
            .values({
                recordId: this.idGenerator.createUuid(),
                profileId,
                externalId,
                mappedType,
                email
            })
            .execute()
        ;

    }

}
import {ContainerInterface} from "Container/Container";
import {Registration} from "Registration/index";
import {
    createRegistrationDatabaseAdapterProvider,
    RegistrationDatabaseAdapterInstanceProvider
} from "Registration/Adapter/Database/DatabaseAdapter";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";
import {EmailCreator} from "Registration/Common/EmailCreator";
import {IdGenerator} from "IdGenerator/IdGenerator";


export class AdapterServiceProvider {
    private config: Registration.Config;

    constructor(config: Registration.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addSingleton(IdGenerator)
            .addObjectFactory(EmailCreator, () => new EmailCreator(this.config.emailDomain), [])
        ;

        container
            .addAsValue(RegistrationDatabaseAdapterInstanceProvider, createRegistrationDatabaseAdapterProvider(this.config.database))
            .addSingleton(MappingRegistryRepository, [RegistrationDatabaseAdapterInstanceProvider, IdGenerator, EmailCreator])
        ;

    }
}

import {ContainerInterface} from "Container/Container";
import {Registration} from "Registration/index";
import {
    createRegistrationDatabaseAdapterProvider,
    RegistrationDatabaseAdapterInstanceProvider
} from "Registration/Adapter/Database/DatabaseAdapter";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";
import {IdGenerator} from "IdGenerator/IdGenerator";
import {LegalEntitiesService} from "Registration/Adapter/Modules/LegalEntitiesService";
import {EmailCreator} from "Registration/Domain/EmailCreator";
import {NorthCapitalAdapter} from "Registration/Adapter/NorthCapital/NorthCapitalAdapter";
import {NorthCapitalSynchronizer} from "Registration/Adapter/NorthCapital/NorthCapitalSynchronizer";
import {
    NorthCapitalSynchronizationRepository
} from "Registration/Adapter/Database/Repository/NorthCapitalSynchronizationRepository";

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
            .addSingleton(NorthCapitalSynchronizationRepository, [RegistrationDatabaseAdapterInstanceProvider, IdGenerator])
        ;

        container
            .addSingleton(LegalEntitiesService, ['LegalEntities'])
        ;

        container
            .addAsValue("NorthCapitalConfig", this.config.northCapital)
            .addSingleton(NorthCapitalAdapter, ["NorthCapitalConfig"])
            .addSingleton(NorthCapitalSynchronizer, [NorthCapitalAdapter, NorthCapitalSynchronizationRepository])
        ;

    }
}

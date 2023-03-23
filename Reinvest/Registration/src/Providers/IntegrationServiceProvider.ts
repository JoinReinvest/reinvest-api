import {ContainerInterface} from "Container/Container";
import {Registration} from "Registration/index";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";
import {SynchronizeProfile} from "Registration/IntegrationLogic/UseCase/SynchronizeProfile";
import {LegalEntitiesService} from "Registration/Adapter/Modules/LegalEntitiesService";
import {NorthCapitalSynchronizer} from "Registration/Adapter/NorthCapital/NorthCapitalSynchronizer";
import {SynchronizeIndividualAccount} from "Registration/IntegrationLogic/UseCase/SynchronizeIndividualAccount";


export class IntegrationServiceProvider {
    private config: Registration.Config;

    constructor(config: Registration.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addSingleton(SynchronizeProfile, [MappingRegistryRepository, LegalEntitiesService, NorthCapitalSynchronizer])
            .addSingleton(SynchronizeIndividualAccount, [MappingRegistryRepository, LegalEntitiesService, NorthCapitalSynchronizer])
        ;

    }
}

import {ContainerInterface} from "Container/Container";
import {Registration} from "Registration/index";
import {ProfileCompletedEventHandler} from "Registration/Port/Queue/EventHandler/ProfileCompletedEventHandler";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";
import {SynchronizeProfile} from "Registration/IntegrationLogic/UseCase/SynchronizeProfile";
import {
    IndividualAccountOpenedEventHandler
} from "Registration/Port/Queue/EventHandler/IndividualAccountOpenedEventHandler";
import {SynchronizeIndividualAccount} from "Registration/IntegrationLogic/UseCase/SynchronizeIndividualAccount";


export class PortsProvider {
    private config: Registration.Config;

    constructor(config: Registration.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addSingleton(ProfileCompletedEventHandler, [MappingRegistryRepository, SynchronizeProfile])
            .addSingleton(IndividualAccountOpenedEventHandler, [MappingRegistryRepository, SynchronizeIndividualAccount])
        ;
    }
}
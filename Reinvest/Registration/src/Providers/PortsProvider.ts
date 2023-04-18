import {ContainerInterface} from "Container/Container";
import {Registration} from "Registration/index";
import {ProfileCompletedEventHandler} from "Registration/Port/Queue/EventHandler/ProfileCompletedEventHandler";
import {MappingRegistryRepository} from "Registration/Adapter/Database/Repository/MappingRegistryRepository";
import {SynchronizeProfile} from "Registration/IntegrationLogic/UseCase/SynchronizeProfile";
import {
    IndividualAccountOpenedEventHandler
} from "Registration/Port/Queue/EventHandler/IndividualAccountOpenedEventHandler";
import {SynchronizeIndividualAccount} from "Registration/IntegrationLogic/UseCase/SynchronizeIndividualAccount";
import {NorthCapitalDocumentSynchronizationQuery} from "Registration/Port/Api/NorthCapitalDocumentSynchronizationQuery";
import {
    NorthCapitalDocumentsSynchronizationRepository
} from "Registration/Adapter/Database/Repository/NorthCapitalDocumentsSynchronizationRepository";
import {
    NorthCapitalDocumentSynchronizationController
} from "Registration/Port/Api/NorthCapitalDocumentSynchronizationController";
import {NorthCapitalSynchronizer} from "Registration/Adapter/NorthCapital/NorthCapitalSynchronizer";
import {CompanyAccountOpenedEventHandler} from "Registration/Port/Queue/EventHandler/CompanyAccountOpenedEventHandler";
import {SynchronizeCompanyAccount} from "Registration/IntegrationLogic/UseCase/SynchronizeCompanyAccount";
import {SynchronizationQuery} from "Registration/Port/Api/SynchronizationQuery";
import {SynchronizationController} from "Registration/Port/Api/SynchronizationController";
import {SynchronizeCompany} from "Registration/IntegrationLogic/UseCase/SynchronizeCompany";
import {SynchronizeStakeholder} from "Registration/IntegrationLogic/UseCase/SynchronizeStakeholder";


export class PortsProvider {
    private config: Registration.Config;

    constructor(config: Registration.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        // api
        container
            .addSingleton(SynchronizationQuery, [MappingRegistryRepository])
            .addSingleton(SynchronizationController, [
                MappingRegistryRepository,
                SynchronizeProfile,
                SynchronizeIndividualAccount,
                SynchronizeCompanyAccount,
                SynchronizeCompany,
                SynchronizeStakeholder
            ])
            .addSingleton(NorthCapitalDocumentSynchronizationQuery, [NorthCapitalDocumentsSynchronizationRepository])
            .addSingleton(NorthCapitalDocumentSynchronizationController, [NorthCapitalSynchronizer])
        ;

        // event handlers
        container
            .addSingleton(ProfileCompletedEventHandler, [MappingRegistryRepository, SynchronizeProfile])
            .addSingleton(IndividualAccountOpenedEventHandler, [MappingRegistryRepository, SynchronizeIndividualAccount])
            .addSingleton(CompanyAccountOpenedEventHandler, [MappingRegistryRepository, SynchronizeCompanyAccount])
        ;
    }
}
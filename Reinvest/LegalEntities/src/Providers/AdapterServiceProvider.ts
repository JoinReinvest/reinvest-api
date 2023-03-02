import {LegalEntities} from "LegalEntities/index";
import {ContainerInterface} from "Container/Container";
import {ProfileRepository} from "LegalEntities/Adapter/Database/Repository/ProfileRepository";
import {
    LegalEntitiesDatabaseAdapterInstanceProvider,
    createLegalEntitiesDatabaseAdapterProvider
} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {IdGenerator} from "IdGenerator/IdGenerator";
import {DocumentsService} from "LegalEntities/Adapter/Modules/DocumentsService";

export class AdapterServiceProvider {
    private config: LegalEntities.Config;

    constructor(config: LegalEntities.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(IdGenerator)

        container
            .addClass(DocumentsService, ['Documents']);

        // database
        container
            .addAsValue(LegalEntitiesDatabaseAdapterInstanceProvider, createLegalEntitiesDatabaseAdapterProvider(this.config.database))
            .addClass(ProfileRepository, [LegalEntitiesDatabaseAdapterInstanceProvider, IdGenerator])
    }
}

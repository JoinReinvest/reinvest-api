import {LegalEntities} from "LegalEntities/index";
import {ContainerInterface} from "Container/Container";
import {PeopleRepository} from "LegalEntities/Adapter/Database/Repository/PeopleRepository";
import {DatabaseAdapterInstance, DatabaseAdapterProvider} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {S3Adapter} from "LegalEntities/Adapter/S3/S3Adapter";
import {FileLinkService} from "LegalEntities/Adapter/S3/FileLinkService";
import {IdGenerator} from "IdGenerator/IdGenerator";

export class AdapterServiceProvider {
    private config: LegalEntities.Config;

    constructor(config: LegalEntities.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(IdGenerator)

        // database
        container
            .addAsValue(DatabaseAdapterInstance, DatabaseAdapterProvider(this.config.database))
            .addClass(PeopleRepository, [DatabaseAdapterInstance])
    }
}

import {LegalEntities} from "LegalEntities/index";
import {ContainerInterface} from "Container/Container";
import {PeopleRepository} from "LegalEntities/Adapter/Database/Repository/PeopleRepository";
import {DatabaseAdapterInstance, DatabaseAdapterProvider} from "LegalEntities/Adapter/Database/DatabaseAdapter";

export class DatabaseServiceProvider {
    private config: LegalEntities.Config;

    constructor(config: LegalEntities.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addAsValue(DatabaseAdapterInstance, DatabaseAdapterProvider(this.config.database))
            .addClass(PeopleRepository, [DatabaseAdapterInstance])
    }
}

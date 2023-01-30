import {Identity} from "Identity/index";
import {ContainerInterface} from "Container/Container";
import {DatabaseAdapterInstance, DatabaseAdapterProvider} from "Identity/Adapter/Database/DatabaseAdapter";
import {IdGenerator} from "IdGenerator/IdGenerator";
import {PhoneRepository} from "Identity/Adapter/Database/Repository/PhoneRepository";

export class AdapterServiceProvider {
    private config: Identity.Config;

    constructor(config: Identity.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(IdGenerator)

        // database
        container
            .addAsValue(DatabaseAdapterInstance, DatabaseAdapterProvider(this.config.database))
            .addClass(PhoneRepository, [DatabaseAdapterInstance])

        // s3
        // container
        //     .addAsValue('S3Config', this.config.s3)
        //     .addClass(S3Adapter, ['S3Config'])
        //     .addClass(FileLinkService, [S3Adapter.getClassName(), IdGenerator.getClassName()])
    }
}

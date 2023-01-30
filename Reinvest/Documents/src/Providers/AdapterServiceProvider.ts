import {Documents} from "Documents/index";
import {ContainerInterface} from "Container/Container";
import {DatabaseAdapterInstance, DatabaseAdapterProvider} from "Documents/Adapter/Database/DatabaseAdapter";
import {S3Adapter} from "Documents/Adapter/S3/S3Adapter";
import {FileLinkService} from "Documents/Adapter/S3/FileLinkService";
import {IdGenerator} from "IdGenerator/IdGenerator";

export class AdapterServiceProvider {
    private config: Documents.Config;

    constructor(config: Documents.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(IdGenerator)

        // database
        container
            .addAsValue(DatabaseAdapterInstance, DatabaseAdapterProvider(this.config.database))

        // s3
        container
            .addAsValue('S3Config', this.config.s3)
            .addClass(S3Adapter, ['S3Config'])
            .addClass(FileLinkService, [S3Adapter.getClassName(), IdGenerator.getClassName()])
    }
}

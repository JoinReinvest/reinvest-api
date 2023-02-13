import {Identity} from "Identity/index";
import {ContainerInterface} from "Container/Container";
import {DatabaseAdapterProvider, createIdentityDatabaseAdapterProvider} from "Identity/Adapter/Database/DatabaseAdapter";
import {IdGenerator} from "IdGenerator/IdGenerator";
import {PhoneRepository} from "Identity/Adapter/Database/Repository/PhoneRepository";
import {UserRepository} from "Identity/Adapter/Database/Repository/UserRepository";
import {ProfileService} from "Identity/Adapter/Profile/ProfileService";
import {CognitoService} from "Identity/Adapter/AWS/CognitoService";

export class AdapterServiceProvider {
    private config: Identity.Config;

    constructor(config: Identity.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(IdGenerator)

        container
            .addClass(CognitoService);

        // database
        container
            .addAsValue(DatabaseAdapterProvider, createIdentityDatabaseAdapterProvider(this.config.database))
            .addClass(PhoneRepository, [DatabaseAdapterProvider])
            .addClass(UserRepository, [DatabaseAdapterProvider, IdGenerator])

        container
            .addClass(ProfileService, ["InvestmentAccounts"]);
    }
}

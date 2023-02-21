import {Identity} from "Identity/index";
import {ContainerInterface} from "Container/Container";
import {
    IdentityDatabaseAdapterProvider,
    createIdentityDatabaseAdapterProvider, DatabaseAdapterProvider, IdentityDatabase
} from "Identity/Adapter/Database/IdentityDatabaseAdapter";
import {IdGenerator} from "IdGenerator/IdGenerator";
import {PhoneRepository} from "Identity/Adapter/Database/Repository/PhoneRepository";
import {UserRepository} from "Identity/Adapter/Database/Repository/UserRepository";
import {ProfileService} from "Identity/Adapter/Profile/ProfileService";
import {CognitoService} from "Identity/Adapter/AWS/CognitoService";
import {UniqueTokenGenerator} from "IdGenerator/UniqueTokenGenerator";
import {TransactionalAdapter} from "PostgreSQL/TransactionalAdapter";
import {SmsService} from "Identity/Adapter/AWS/SmsService";

export class AdapterServiceProvider {
    private config: Identity.Config;

    constructor(config: Identity.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(IdGenerator)
            .addClass(UniqueTokenGenerator)
        ;

        container
            .addAsValue('SNSConfig', this.config.SNS)
            .addAsValue('CognitoConfig', this.config.Cognito)
        ;

        container
            .addClass(SmsService, ['SNSConfig'])
            .addClass(CognitoService, ['CognitoConfig'])
        ;

        // database
        container
            .addAsValue(DatabaseAdapterProvider, createIdentityDatabaseAdapterProvider(this.config.database))
            .addClassOfType<IdentityDatabase>(TransactionalAdapter, [DatabaseAdapterProvider])
            .addClass(PhoneRepository, [DatabaseAdapterProvider, TransactionalAdapter, SmsService, CognitoService])
            .addClass(UserRepository, [DatabaseAdapterProvider, UniqueTokenGenerator])
        ;
        container
            .addClass(ProfileService, ["InvestmentAccounts"])
        ;
    }
}

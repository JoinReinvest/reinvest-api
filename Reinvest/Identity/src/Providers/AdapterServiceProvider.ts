import {Identity} from "Identity/index";
import {ContainerInterface} from "Container/Container";
import {
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
import {IncentiveTokenRepository} from "Identity/Adapter/Database/Repository/IncentiveTokenRepository";
import {DatabaseProvider} from "PostgreSQL/DatabaseProvider";

export class AdapterServiceProvider {
    private config: Identity.Config;

    constructor(config: Identity.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addSingleton(IdGenerator)
            .addSingleton(UniqueTokenGenerator)
        ;

        container
            .addAsValue('SNSConfig', this.config.SNS)
            .addAsValue('CognitoConfig', this.config.Cognito)
        ;

        container
            .addSingleton(SmsService, ['SNSConfig'])
            .addSingleton(CognitoService, ['CognitoConfig'])
        ;

        // database
        container
            .addAsValue(DatabaseAdapterProvider, createIdentityDatabaseAdapterProvider(this.config.database))
            .addObjectFactory(TransactionalAdapter,
                (databaseProvider: DatabaseProvider<IdentityDatabase>) =>
                    new TransactionalAdapter<IdentityDatabase>(databaseProvider),
                [DatabaseAdapterProvider]
            )
            .addSingleton(PhoneRepository, [DatabaseAdapterProvider, TransactionalAdapter, SmsService, CognitoService])
            .addSingleton(IncentiveTokenRepository, [DatabaseAdapterProvider, UniqueTokenGenerator])
            .addSingleton(UserRepository, [DatabaseAdapterProvider])
        ;
        container
            .addSingleton(ProfileService, ["InvestmentAccounts"])
        ;
    }
}

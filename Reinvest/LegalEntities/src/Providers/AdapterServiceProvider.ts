import {LegalEntities} from "LegalEntities/index";
import {ContainerInterface} from "Container/Container";
import {ProfileRepository} from "LegalEntities/Adapter/Database/Repository/ProfileRepository";
import {
    LegalEntitiesDatabaseAdapterInstanceProvider,
    createLegalEntitiesDatabaseAdapterProvider, LegalEntitiesDatabase, LegalEntitiesDatabaseAdapterProvider
} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {IdGenerator} from "IdGenerator/IdGenerator";
import {DocumentsService} from "LegalEntities/Adapter/Modules/DocumentsService";
import {DraftAccountRepository} from "LegalEntities/Adapter/Database/Repository/DraftAccountRepository";
import {CreateDraftAccount} from "LegalEntities/UseCases/CreateDraftAccount";
import {CompleteDraftAccount} from "LegalEntities/UseCases/CompleteDraftAccount";
import {DraftAccountQuery} from "LegalEntities/UseCases/DraftAccountQuery";
import {TransactionalAdapter} from "PostgreSQL/TransactionalAdapter";
import {TransformDraftAccountIntoRegularAccount} from "LegalEntities/UseCases/TransformDraftAccountIntoRegularAccount";
import {InvestmentAccountsService} from "LegalEntities/Adapter/Modules/InvestmentAccountsService";
import {AccountRepository} from "LegalEntities/Adapter/Database/Repository/AccountRepository";
import {RemoveDraftAccount} from "LegalEntities/UseCases/RemoveDraftAccount";

export class AdapterServiceProvider {
    private config: LegalEntities.Config;

    constructor(config: LegalEntities.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addSingleton(IdGenerator)

        container
            .addSingleton(DocumentsService, ['Documents'])
            .addSingleton(InvestmentAccountsService, ['InvestmentAccounts'])
        ;

        // database
        container
            .addAsValue(LegalEntitiesDatabaseAdapterInstanceProvider, createLegalEntitiesDatabaseAdapterProvider(this.config.database))
            .addSingleton(ProfileRepository, [LegalEntitiesDatabaseAdapterInstanceProvider, IdGenerator])
            .addSingleton(DraftAccountRepository, [LegalEntitiesDatabaseAdapterInstanceProvider, IdGenerator])
            .addSingleton(AccountRepository, [LegalEntitiesDatabaseAdapterInstanceProvider])
            .addObjectFactory("LegalEntitiesTransactionalAdapter",
                (databaseProvider: LegalEntitiesDatabaseAdapterProvider) =>
                    new TransactionalAdapter<LegalEntitiesDatabase>(databaseProvider),
                [LegalEntitiesDatabaseAdapterInstanceProvider]
            )
        ;

        // use cases
        container
            .addSingleton(CreateDraftAccount, [DraftAccountRepository])
            .addSingleton(CompleteDraftAccount, [DraftAccountRepository])
            .addSingleton(DraftAccountQuery, [DraftAccountRepository, DocumentsService])
            .addSingleton(RemoveDraftAccount, [DraftAccountRepository])
            .addSingleton(TransformDraftAccountIntoRegularAccount, [DraftAccountRepository, InvestmentAccountsService, AccountRepository, "LegalEntitiesTransactionalAdapter"])
        ;
    }
}

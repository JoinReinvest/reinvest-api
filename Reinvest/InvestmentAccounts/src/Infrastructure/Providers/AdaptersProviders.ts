import {ContainerInterface} from "Container/Container";
import {InvestmentAccounts} from "InvestmentAccounts/index";
import {
    createInvestmentAccountsDatabaseAdapterProvider, InvestmentAccountDbProvider, InvestmentAccountsDatabase,
    investmentAccountsDatabaseProviderName
} from "InvestmentAccounts/Infrastructure/Storage/DatabaseAdapter";
import {ProfileQuery} from "InvestmentAccounts/Infrastructure/Storage/Queries/ProfileQuery";
import ProfileQueryService, {QueryProfileRepository} from "InvestmentAccounts/ProfileQueryService";
import {AggregateRepository} from "SimpleAggregator/Storage/AggregateRepository";
import {ProfileRepository} from "InvestmentAccounts/Infrastructure/Storage/Repository/ProfileRepository";
import {TransactionalAdapter} from "PostgreSQL/TransactionalAdapter";
import {SimpleEventBus} from "SimpleAggregator/EventBus/EventBus";

export default class AdaptersProviders {
    private config: InvestmentAccounts.Config;

    constructor(config: InvestmentAccounts.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container.addAsValue(SimpleEventBus.getClassName(), new SimpleEventBus(container));

        container
            .addAsValue(investmentAccountsDatabaseProviderName, createInvestmentAccountsDatabaseAdapterProvider(this.config.database))
            .addClassOfType<InvestmentAccountsDatabase>(TransactionalAdapter, [investmentAccountsDatabaseProviderName])
            .addClassOfType<InvestmentAccountDbProvider>(AggregateRepository, [investmentAccountsDatabaseProviderName])
            .addClass(ProfileRepository, [AggregateRepository, TransactionalAdapter, SimpleEventBus])
        ;
        container
            .addClass(ProfileQuery, [investmentAccountsDatabaseProviderName])
            .addClass(QueryProfileRepository)
            .addClass(ProfileQueryService, [QueryProfileRepository]);
        ;
    }
}

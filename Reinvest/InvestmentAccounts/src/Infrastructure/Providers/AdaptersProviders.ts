import {ContainerInterface} from "Container/Container";
import {InvestmentAccounts} from "InvestmentAccounts/index";
import {
    createInvestmentAccountsDatabaseAdapterProvider, InvestmentAccountDbProvider,
    investmentAccountsDatabaseProviderName
} from "InvestmentAccounts/Infrastructure/Storage/DatabaseAdapter";
import {ProfileQuery} from "InvestmentAccounts/Infrastructure/Storage/Queries/ProfileQuery";
import ProfileQueryService, {QueryProfileRepository} from "InvestmentAccounts/ProfileQueryService";
import {AggregateRepository} from "SimpleAggregator/Storage/AggregateRepository";
import {ProfileRepository} from "InvestmentAccounts/Infrastructure/Storage/Repository/ProfileRepository";
import {TransactionalAdapter} from "InvestmentAccounts/Infrastructure/Storage/TransactionalAdapter";

export default class AdaptersProviders {
    private config: InvestmentAccounts.Config;

    constructor(config: InvestmentAccounts.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addAsValue(investmentAccountsDatabaseProviderName, createInvestmentAccountsDatabaseAdapterProvider(this.config.database))
            .addClass(TransactionalAdapter, [investmentAccountsDatabaseProviderName])
            .addClassOfType<InvestmentAccountDbProvider>(AggregateRepository, [investmentAccountsDatabaseProviderName])
            .addClass(ProfileRepository, [AggregateRepository, TransactionalAdapter])
        ;
        container
            .addClass(ProfileQuery, [investmentAccountsDatabaseProviderName])
            .addClass(QueryProfileRepository)
            .addClass(ProfileQueryService, [QueryProfileRepository]);
        ;
    }
}

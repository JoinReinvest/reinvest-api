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
import {QueueSender} from "shared/hkek-sqs/QueueSender";
import {SendToQueueEventHandler} from "SimpleAggregator/EventBus/SendToQueueEventHandler";

export default class AdaptersProviders {
    private config: InvestmentAccounts.Config;

    constructor(config: InvestmentAccounts.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addAsValue(SimpleEventBus.getClassName(), new SimpleEventBus(container))
            .addObjectFactory(QueueSender, () => new QueueSender(this.config.queue), [])
            .addObjectFactory(SendToQueueEventHandler, (queueSender: QueueSender) => new SendToQueueEventHandler(queueSender), [QueueSender]);

        container
            .addAsValue(investmentAccountsDatabaseProviderName, createInvestmentAccountsDatabaseAdapterProvider(this.config.database))
            .addObjectFactory("InvestmentAccountsTransactionalAdapter",
                (databaseProvider: InvestmentAccountDbProvider) =>
                    new TransactionalAdapter<InvestmentAccountsDatabase>(databaseProvider),
                [investmentAccountsDatabaseProviderName]
            )
            .addObjectFactory("ProfileAggregateRepository",
                (databaseProvider: InvestmentAccountDbProvider) =>
                    new AggregateRepository<InvestmentAccountDbProvider>(databaseProvider),
                [investmentAccountsDatabaseProviderName]
            )
            .addSingleton(ProfileRepository, ["ProfileAggregateRepository", "InvestmentAccountsTransactionalAdapter", SimpleEventBus])
        ;
        container
            .addSingleton(ProfileQuery, [investmentAccountsDatabaseProviderName])
            .addSingleton(QueryProfileRepository)
            .addSingleton(ProfileQueryService, [QueryProfileRepository]);
        ;
    }
}

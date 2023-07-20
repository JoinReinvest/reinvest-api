import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { ConfigurationRepository } from 'SharesAndDividends/Adapter/Database/Repository/ConfigurationRepository';
import { DividendsCalculationRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsCalculationRepository';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { FinancialOperationsRepository } from 'SharesAndDividends/Adapter/Database/Repository/FinancialOperationsRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { IdentityService } from 'SharesAndDividends/Adapter/Modules/IdentityService';
import { NotificationService } from 'SharesAndDividends/Adapter/Modules/NotificationService';
import { PortfolioService } from 'SharesAndDividends/Adapter/Modules/PortfolioService';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { AccountStateQuery } from 'SharesAndDividends/UseCase/AccountStateQuery';
import { CalculateDividends } from 'SharesAndDividends/UseCase/CalculateDividends';
import { ChangeLockedCalculatedDividendStatus } from 'SharesAndDividends/UseCase/ChangeLockedCalculatedDividendStatus';
import { ChangeSharesState } from 'SharesAndDividends/UseCase/ChangeSharesState';
import CreateConfiguration from 'SharesAndDividends/UseCase/CreateConfiguration';
import { CreateDividendDistribution } from 'SharesAndDividends/UseCase/CreateDividendDistribution';
import { CreateIncentiveReward } from 'SharesAndDividends/UseCase/CreateIncentiveReward';
import { CreateShares } from 'SharesAndDividends/UseCase/CreateShares';
import { DeclareDividend } from 'SharesAndDividends/UseCase/DeclareDividend';
import { DistributeDividends } from 'SharesAndDividends/UseCase/DistributeDividends';
import { DividendsCalculationQuery } from 'SharesAndDividends/UseCase/DividendsCalculationQuery';
import { DividendsListQuery } from 'SharesAndDividends/UseCase/DividendsListQuery';
import { DividendsQuery } from 'SharesAndDividends/UseCase/DividendsQuery';
import { FinishDividendsCalculation } from 'SharesAndDividends/UseCase/FinishDividendsCalculation';
import { FinishDividendsDistribution } from 'SharesAndDividends/UseCase/FinishDividendsDistribution';
import GetConfiguration from 'SharesAndDividends/UseCase/GetConfiguration';
import { GiveIncentiveRewardIfRequirementsAreMet } from 'SharesAndDividends/UseCase/GiveIncentiveRewardIfRequirementsAreMet';
import { MarkDividendAsReinvested } from 'SharesAndDividends/UseCase/MarkDividendAsReinvested';
import { MarkDividendAsWithdrawn } from 'SharesAndDividends/UseCase/MarkDividendAsWithdrawn';
import { StatsQuery } from 'SharesAndDividends/UseCase/StatsQuery';
import { TransferDividends } from 'SharesAndDividends/UseCase/TransferDividends';
import { TransferShares } from 'SharesAndDividends/UseCase/TransferShares';

export class UseCaseProvider {
  private config: SharesAndDividends.Config;

  constructor(config: SharesAndDividends.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // queries
    container.addSingleton(StatsQuery, [SharesRepository, PortfolioService, DividendsRepository, FinancialOperationsRepository]);
    container.addSingleton(DividendsQuery, [DividendsRepository]);
    container.addSingleton(DividendsCalculationQuery, [DividendsCalculationRepository]);
    container.addSingleton(DividendsListQuery, [DividendsRepository]);

    // use cases
    container.addSingleton(CreateShares, [SharesRepository, IdGenerator]);
    container.addSingleton(TransferShares, [SharesRepository, FinancialOperationsRepository, IdGenerator]);
    container.addSingleton(TransferDividends, [DividendsCalculationRepository, NotificationService, IdGenerator]);
    container.addSingleton(ChangeSharesState, [SharesRepository, FinancialOperationsRepository, 'SharesAndDividendsTransactionalAdapter']);
    container.addSingleton(CreateIncentiveReward, [DividendsRepository, IdGenerator, NotificationService]);
    container.addSingleton(DeclareDividend, [IdGenerator, DividendsCalculationRepository, SharesRepository]);
    container.addSingleton(CalculateDividends, [IdGenerator, DividendsCalculationRepository, SharesRepository]);
    container.addSingleton(CreateDividendDistribution, [IdGenerator, DividendsCalculationRepository]);
    container.addSingleton(FinishDividendsCalculation, [DividendsCalculationRepository]);
    container.addSingleton(FinishDividendsDistribution, [DividendsCalculationRepository]);
    container.addSingleton(DistributeDividends, [
      IdGenerator,
      DividendsCalculationRepository,
      SharesRepository,
      'SharesAndDividendsTransactionalAdapter',
      NotificationService,
    ]);
    container.addSingleton(MarkDividendAsReinvested, [DividendsRepository, NotificationService]);
    container.addSingleton(MarkDividendAsWithdrawn, [DividendsRepository, NotificationService]);
    container.addSingleton(AccountStateQuery, [DividendsRepository, SharesRepository, PortfolioService]);
    container.addSingleton(CreateConfiguration, [ConfigurationRepository, IdGenerator]).addSingleton(GetConfiguration, [ConfigurationRepository]);
    container.addSingleton(GiveIncentiveRewardIfRequirementsAreMet, [DividendsRepository, IdentityService, SharesRepository, CreateIncentiveReward]);
    container.addSingleton(ChangeLockedCalculatedDividendStatus, [DividendsCalculationRepository]);
  }
}

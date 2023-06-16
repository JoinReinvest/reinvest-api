import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { DividendsCalculationRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsCalculationRepository';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { FinancialOperationsRepository } from 'SharesAndDividends/Adapter/Database/Repository/FinancialOperationsRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { NotificationService } from 'SharesAndDividends/Adapter/Modules/NotificationService';
import { PortfolioService } from 'SharesAndDividends/Adapter/Modules/PortfolioService';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { AccountStateQuery } from 'SharesAndDividends/UseCase/AccountStateQuery';
import { CalculateDividends } from 'SharesAndDividends/UseCase/CalculateDividends';
import { ChangeSharesState } from 'SharesAndDividends/UseCase/ChangeSharesState';
import { CreateDividendDistribution } from 'SharesAndDividends/UseCase/CreateDividendDistribution';
import { CreateIncentiveReward } from 'SharesAndDividends/UseCase/CreateIncentiveReward';
import { CreateShares } from 'SharesAndDividends/UseCase/CreateShares';
import { DeclareDividend } from 'SharesAndDividends/UseCase/DeclareDividend';
import { DistributeDividends } from 'SharesAndDividends/UseCase/DistributeDividends';
import { DividendsCalculationQuery } from 'SharesAndDividends/UseCase/DividendsCalculationQuery';
import { DividendsQuery } from 'SharesAndDividends/UseCase/DividendsQuery';
import { FinishDividendsCalculation } from 'SharesAndDividends/UseCase/FinishDividendsCalculation';
import { FinishDividendsDistribution } from 'SharesAndDividends/UseCase/FinishDividendsDistribution';
import { MarkDividendAsReinvested } from 'SharesAndDividends/UseCase/MarkDividendAsReinvested';
import { StatsQuery } from 'SharesAndDividends/UseCase/StatsQuery';

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

    // use cases
    container.addSingleton(CreateShares, [SharesRepository, IdGenerator]);
    container.addSingleton(ChangeSharesState, [SharesRepository, IdGenerator, FinancialOperationsRepository, 'SharesAndDividendsTransactionalAdapter']);
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
    container.addSingleton(MarkDividendAsReinvested, [DividendsRepository]);
    container.addSingleton(AccountStateQuery, [DividendsRepository, SharesRepository, PortfolioService]);
  }
}

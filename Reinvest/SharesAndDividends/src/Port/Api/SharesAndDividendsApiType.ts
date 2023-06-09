import { ContainerInterface } from 'Container/Container';
import { DividendsCalculationController } from 'SharesAndDividends/Port/Api/DividendsCalculationController';
import { DividendsController } from 'SharesAndDividends/Port/Api/DividendsController';
import { IncentiveRewardController } from 'SharesAndDividends/Port/Api/IncentiveRewardController';
import { SharesController } from 'SharesAndDividends/Port/Api/SharesController';
import { StatsController } from 'SharesAndDividends/Port/Api/StatsController';

export type SharesAndDividendsApiType = {
  calculateDividendsForShares: DividendsCalculationController['calculateDividendsForShares'];
  createManuallyIncentiveReward: IncentiveRewardController['createManuallyIncentiveReward'];
  createShares: SharesController['createShares'];
  declareDividend: DividendsCalculationController['declareDividend'];
  getAccountStats: StatsController['getAccountStats'];
  getDividend: DividendsController['getDividend'];
  getDividendDeclarationByDate: DividendsCalculationController['getDividendDeclarationByDate'];
  getDividendDeclarationStats: DividendsCalculationController['getDividendDeclarationStats'];
  getDividendDeclarations: DividendsCalculationController['getDividendDeclarations'];
  getEVSChart: StatsController['getEVSChart'];
  getNextSharesToCalculate: DividendsCalculationController['getNextSharesToCalculate'];
  markDividendReinvested: DividendsController['markDividendReinvested'];
  setSharesToFundedState: SharesController['setSharesToFundedState'];
  setSharesToFundingState: SharesController['setSharesToFundingState'];
  setSharesToSettledState: SharesController['setSharesToSettledState'];
};

export const SharesAndDividendsApi = (container: ContainerInterface): SharesAndDividendsApiType => ({
  createShares: container.delegateTo(SharesController, 'createShares'),
  getAccountStats: container.delegateTo(StatsController, 'getAccountStats'),
  setSharesToFundedState: container.delegateTo(SharesController, 'setSharesToFundedState'),
  setSharesToFundingState: container.delegateTo(SharesController, 'setSharesToFundingState'),
  setSharesToSettledState: container.delegateTo(SharesController, 'setSharesToSettledState'),
  getEVSChart: container.delegateTo(StatsController, 'getEVSChart'),
  createManuallyIncentiveReward: container.delegateTo(IncentiveRewardController, 'createManuallyIncentiveReward'),
  getDividend: container.delegateTo(DividendsController, 'getDividend'),
  markDividendReinvested: container.delegateTo(DividendsController, 'markDividendReinvested'),
  declareDividend: container.delegateTo(DividendsCalculationController, 'declareDividend'),
  getDividendDeclarations: container.delegateTo(DividendsCalculationController, 'getDividendDeclarations'),
  getDividendDeclarationByDate: container.delegateTo(DividendsCalculationController, 'getDividendDeclarationByDate'),
  getNextSharesToCalculate: container.delegateTo(DividendsCalculationController, 'getNextSharesToCalculate'),
  calculateDividendsForShares: container.delegateTo(DividendsCalculationController, 'calculateDividendsForShares'),
  getDividendDeclarationStats: container.delegateTo(DividendsCalculationController, 'getDividendDeclarationStats'),
});

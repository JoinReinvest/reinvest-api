import { ContainerInterface } from 'Container/Container';
import { ConfigurationController } from 'SharesAndDividends/Port/Api/ConfigurationController';
import { DividendsCalculationController } from 'SharesAndDividends/Port/Api/DividendsCalculationController';
import { DividendsController } from 'SharesAndDividends/Port/Api/DividendsController';
import { IncentiveRewardController } from 'SharesAndDividends/Port/Api/IncentiveRewardController';
import { SharesController } from 'SharesAndDividends/Port/Api/SharesController';
import { StatsController } from 'SharesAndDividends/Port/Api/StatsController';

export type SharesAndDividendsApiType = {
  calculateDividendsForShares: DividendsCalculationController['calculateDividendsForShares'];
  calculationsCompleted: DividendsCalculationController['calculationsCompleted'];
  createConfiguration: ConfigurationController['createConfiguration'];
  createDividendDistribution: DividendsCalculationController['createDividendDistribution'];
  createManuallyIncentiveReward: IncentiveRewardController['createManuallyIncentiveReward'];
  createShares: SharesController['createShares'];
  declareDividend: DividendsCalculationController['declareDividend'];
  distributeDividends: DividendsCalculationController['distributeDividends'];
  distributionsCompleted: DividendsCalculationController['distributionsCompleted'];
  getAccountState: SharesController['getAccountState'];
  getAccountStats: StatsController['getAccountStats'];
  getAccountsForDividendDistribution: DividendsCalculationController['getAccountsForDividendDistribution'];
  getConfiguration: ConfigurationController['getConfiguration'];
  getDividend: DividendsController['getDividend'];
  getDividendDeclarationByDate: DividendsCalculationController['getDividendDeclarationByDate'];
  getDividendDeclarationStats: DividendsCalculationController['getDividendDeclarationStats'];
  getDividendDeclarations: DividendsCalculationController['getDividendDeclarations'];
  getDividendDistributionById: DividendsCalculationController['getDividendDistributionById'];
  getDividendsList: DividendsController['getDividendsList'];
  getDividendsReadyForAutomaticReinvestment: DividendsController['getDividendsReadyForAutomaticReinvestment'];
  getEVSChart: StatsController['getEVSChart'];
  getNextSharesToCalculate: DividendsCalculationController['getNextSharesToCalculate'];
  getSharesOriginalOwners: SharesController['getSharesOriginalOwners'];
  markDividendAsWithdrew: DividendsController['markDividendAsWithdrew'];
  markDividendReinvested: DividendsController['markDividendReinvested'];
  setSharesToFundedState: SharesController['setSharesToFundedState'];
  setSharesToFundingState: SharesController['setSharesToFundingState'];
  setSharesToRevokedState: SharesController['setSharesToRevokedState'];
  setSharesToSettledState: SharesController['setSharesToSettledState'];
  transferDividends: DividendsController['transferDividends'];
  transferShares: SharesController['transferShares'];
};

export const SharesAndDividendsApi = (container: ContainerInterface): SharesAndDividendsApiType => ({
  calculateDividendsForShares: container.delegateTo(DividendsCalculationController, 'calculateDividendsForShares'),
  createConfiguration: container.delegateTo(ConfigurationController, 'createConfiguration'),
  getConfiguration: container.delegateTo(ConfigurationController, 'getConfiguration'),
  createShares: container.delegateTo(SharesController, 'createShares'),
  getAccountStats: container.delegateTo(StatsController, 'getAccountStats'),
  setSharesToFundedState: container.delegateTo(SharesController, 'setSharesToFundedState'),
  setSharesToFundingState: container.delegateTo(SharesController, 'setSharesToFundingState'),
  setSharesToSettledState: container.delegateTo(SharesController, 'setSharesToSettledState'),
  getEVSChart: container.delegateTo(StatsController, 'getEVSChart'),
  createManuallyIncentiveReward: container.delegateTo(IncentiveRewardController, 'createManuallyIncentiveReward'),
  getDividend: container.delegateTo(DividendsController, 'getDividend'),
  getDividendsList: container.delegateTo(DividendsController, 'getDividendsList'),
  markDividendReinvested: container.delegateTo(DividendsController, 'markDividendReinvested'),
  declareDividend: container.delegateTo(DividendsCalculationController, 'declareDividend'),
  getDividendDeclarations: container.delegateTo(DividendsCalculationController, 'getDividendDeclarations'),
  getDividendDeclarationByDate: container.delegateTo(DividendsCalculationController, 'getDividendDeclarationByDate'),
  getNextSharesToCalculate: container.delegateTo(DividendsCalculationController, 'getNextSharesToCalculate'),
  getDividendDeclarationStats: container.delegateTo(DividendsCalculationController, 'getDividendDeclarationStats'),
  distributeDividends: container.delegateTo(DividendsCalculationController, 'distributeDividends'),
  getDividendDistributionById: container.delegateTo(DividendsCalculationController, 'getDividendDistributionById'),
  getAccountsForDividendDistribution: container.delegateTo(DividendsCalculationController, 'getAccountsForDividendDistribution'),
  createDividendDistribution: container.delegateTo(DividendsCalculationController, 'createDividendDistribution'),
  calculationsCompleted: container.delegateTo(DividendsCalculationController, 'calculationsCompleted'),
  distributionsCompleted: container.delegateTo(DividendsCalculationController, 'distributionsCompleted'),
  getAccountState: container.delegateTo(SharesController, 'getAccountState'),
  markDividendAsWithdrew: container.delegateTo(DividendsController, 'markDividendAsWithdrew'),
  setSharesToRevokedState: container.delegateTo(SharesController, 'setSharesToRevokedState'),
  transferShares: container.delegateTo(SharesController, 'transferShares'),
  transferDividends: container.delegateTo(DividendsController, 'transferDividends'),
  getDividendsReadyForAutomaticReinvestment: container.delegateTo(DividendsController, 'getDividendsReadyForAutomaticReinvestment'),
  getSharesOriginalOwners: container.delegateTo(SharesController, 'getSharesOriginalOwners'),
});

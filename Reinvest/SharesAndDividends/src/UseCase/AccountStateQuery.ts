import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { PortfolioService } from 'SharesAndDividends/Adapter/Modules/PortfolioService';
import { CurrentNav } from 'SharesAndDividends/Domain/Stats/AccountStatsCalculationService';

export type AccountState = {
  areThereNotSettledShares: boolean;
  awaitingDividends: {
    id: string;
    totalDividendAmount: number;
    totalFeeAmount: number;
  }[];
  settledShares: {
    currentNavPerShare: number;
    id: string;
    numberOfShares: number;
    transactionDate: Date;
    unitPrice: number;
  }[];
};

export type SharesOriginalOwner = { originalOwnerId: UUID; sharesId: UUID };

export class AccountStateQuery {
  private dividendsRepository: DividendsRepository;
  private sharesRepository: SharesRepository;
  private portfolioService: PortfolioService;

  constructor(dividendsRepository: DividendsRepository, sharesRepository: SharesRepository, portfolioService: PortfolioService) {
    this.dividendsRepository = dividendsRepository;
    this.sharesRepository = sharesRepository;
    this.portfolioService = portfolioService;
  }

  static getClassName = () => 'AccountStateQuery';

  async getAccountState(profileId: string, accountId: string): Promise<AccountState> {
    const awaitingInvestorDividends = await this.dividendsRepository.getAwaitingDividendsForAccountState(profileId, accountId);
    const awaitingReferralDividends = await this.dividendsRepository.getAwaitingReferralRewardsForAccountState(profileId, accountId);
    const settledShares = await this.sharesRepository.getSettledSharesForAccountState(profileId, accountId);
    const areThereNotSettledShares = await this.sharesRepository.areThereNotSettledShares(profileId, accountId);

    const referralDividends = awaitingReferralDividends.map(dividend => ({
      id: dividend.id,
      totalDividendAmount: dividend.amount,
      totalFeeAmount: 0,
    }));

    const currentNavs: { [portfolioId: string]: CurrentNav } = {};
    const shares = [];

    for (const share of settledShares) {
      if (!currentNavs[share.portfolioId]) {
        currentNavs[share.portfolioId] = await this.portfolioService.getCurrentNav(share.portfolioId);
      }

      const { unitSharePrice } = currentNavs[share.portfolioId]!;

      shares.push({
        id: share.id,
        numberOfShares: share.numberOfShares!,
        transactionDate: DateTime.from(share.dateFunding!).toDate(),
        unitPrice: share.unitPrice!,
        currentNavPerShare: unitSharePrice.getAmount(),
      });
    }

    return {
      areThereNotSettledShares,
      awaitingDividends: [...awaitingInvestorDividends, ...referralDividends],
      settledShares: shares,
    };
  }

  async getSharesOriginalOwners(sharesIds: UUID[]): Promise<SharesOriginalOwner[]> {
    return this.sharesRepository.getSharesOriginalOwners(sharesIds);
  }
}

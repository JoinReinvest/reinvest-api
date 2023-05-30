import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { DividendDetails, DividendsQuery } from 'SharesAndDividends/UseCase/DividendsQuery';

export class DividendsController {
  private dividendsQuery: DividendsQuery;
  private dividendsRepository: DividendsRepository;

  constructor(dividendsQuery: DividendsQuery, dividendsRepository: DividendsRepository) {
    this.dividendsQuery = dividendsQuery;
    this.dividendsRepository = dividendsRepository;
  }

  static getClassName = () => 'DividendsController';

  async getDividend(profileId: string, dividendId: string): Promise<DividendDetails | null> {
    return this.dividendsQuery.getDividend(profileId, dividendId);
  }

  async markDividendReinvested(profileId: string, accountId: string, dividendId: string): Promise<void> {
    // TODO include regular investor dividend - do it on the domain side, not on db side!!
    await this.dividendsRepository.markIncentiveDividendReinvested(profileId, accountId, dividendId);
  }
}

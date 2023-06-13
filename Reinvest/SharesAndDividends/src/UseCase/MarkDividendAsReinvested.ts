import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';

export class MarkDividendAsReinvested {
  private dividendsRepository: DividendsRepository;

  constructor(dividendsRepository: DividendsRepository) {
    this.dividendsRepository = dividendsRepository;
  }

  static getClassName = () => 'MarkDividendAsReinvested';

  async execute(profileId: string, accountId: string, dividendId: string): Promise<void> {
    // TODO include regular investor dividend - do it on the domain side, not on db side!!
    await this.dividendsRepository.markIncentiveDividendReinvested(profileId, accountId, dividendId);
  }
}

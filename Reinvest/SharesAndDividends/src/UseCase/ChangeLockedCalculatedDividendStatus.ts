import { UUID } from 'HKEKTypes/Generics';
import { DividendsCalculationRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsCalculationRepository';

export enum SharesStatusChange {
  SETTLED = 'SETTLED',
  REVOKED = 'REVOKED',
}

export class ChangeLockedCalculatedDividendStatus {
  private dividendsCalculationRepository: DividendsCalculationRepository;

  constructor(dividendsCalculationRepository: DividendsCalculationRepository) {
    this.dividendsCalculationRepository = dividendsCalculationRepository;
  }

  static getClassName = () => 'ChangeLockedCalculatedDividendStatus';

  async execute(sharesId: UUID, sharesStatusChange: SharesStatusChange): Promise<void> {
    const dividends = await this.dividendsCalculationRepository.getLockedDividendsBySharesId(sharesId);

    if (dividends.length === 0) {
      return;
    }

    for (const dividend of dividends) {
      if (sharesStatusChange === SharesStatusChange.SETTLED) {
        dividend.unlockDividend();
      } else {
        dividend.revokeDividend();
      }
    }

    await this.dividendsCalculationRepository.updateCalculatedDividends(dividends);
  }
}

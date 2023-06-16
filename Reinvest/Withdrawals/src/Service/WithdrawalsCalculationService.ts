import { UUID } from 'HKEKTypes/Generics';
import { SharesAndDividendsService } from 'Withdrawals/Adapter/Module/SharesAndDividendsService';

export class WithdrawalsCalculationService {
  private sharesAndDividendsService: SharesAndDividendsService;

  constructor(sharesAndDividendsService: SharesAndDividendsService) {
    this.sharesAndDividendsService = sharesAndDividendsService;
  }

  calculateWithdrawals(profileId: UUID, accountId: UUID): Promise<any> {
    return {};
  }
}

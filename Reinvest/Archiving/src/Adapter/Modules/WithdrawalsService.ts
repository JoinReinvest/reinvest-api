import { UUID } from 'HKEKTypes/Generics';
import { Withdrawals } from 'Withdrawals/index';

export class WithdrawalsService {
  private withdrawalsModule: Withdrawals.Main;
  static getClassName = (): string => 'WithdrawalsService';

  constructor(withdrawalsModule: Withdrawals.Main) {
    this.withdrawalsModule = withdrawalsModule;
  }

  async hasPendingWithdrawal(profileId: UUID, accountId: UUID): Promise<boolean> {
    const api = this.withdrawalsModule.api();
    try {
      const request = await api.getPendingWithdrawalRequest(profileId, accountId);

      if (!request) {
        return true;
      }

      return false;
    } catch (error: any) {
      return false;
    }
  }
}

import { TransferredInvestments } from 'Archiving/Domain/ArchivedBeneficiary';
import { UUID } from 'HKEKTypes/Generics';
import { Investments } from 'Investments/index';

export class InvestmentsService {
  private investmentsModule: Investments.Main;
  static getClassName = (): string => 'InvestmentsService';

  constructor(investmentsModule: Investments.Main) {
    this.investmentsModule = investmentsModule;
  }

  async transferInvestments(profileId: UUID, transferFromAccount: UUID, transferToAccount: UUID): Promise<TransferredInvestments[]> {
    const api = this.investmentsModule.api();

    return api.transferInvestments(profileId, transferFromAccount, transferToAccount);
  }

  async disableRecurringInvestment(profileId: UUID, accountId: UUID): Promise<void> {
    return;
  }
}

import { TransferredInvestments, TransferredShares } from 'Archiving/Domain/ArchivedBeneficiary';
import { UUID } from 'HKEKTypes/Generics';
import { SharesAndDividends } from 'SharesAndDividends/index';

export class SharesAndDividendsService {
  private sharesAndDividendsModule: SharesAndDividends.Main;
  static getClassName = (): string => 'SharesAndDividendsService';

  constructor(sharesAndDividendsModule: SharesAndDividends.Main) {
    this.sharesAndDividendsModule = sharesAndDividendsModule;
  }

  async transferShares(
    profileId: UUID,
    transferFromAccount: UUID,
    transferToAccount: UUID,
    transferredInvestments: TransferredInvestments[],
  ): Promise<TransferredShares[]> {
    const api = this.sharesAndDividendsModule.api();

    const transferredOrigins = transferredInvestments.map(investment => ({
      newId: investment.newInvestmentId,
      previousId: investment.previousInvestmentId,
    }));

    return api.transferShares(profileId, transferFromAccount, transferToAccount, transferredOrigins);
  }
}

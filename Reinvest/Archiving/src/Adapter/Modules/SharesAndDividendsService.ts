import { TransferredDividends, TransferredInvestments, TransferredShares } from 'Archiving/Domain/ArchivedBeneficiary';
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
    tranferredDividends: TransferredDividends[],
  ): Promise<TransferredShares[]> {
    const api = this.sharesAndDividendsModule.api();
    const transferredOrigins = [];

    for (const investment of transferredInvestments) {
      transferredOrigins.push({
        newId: investment.newInvestmentId,
        previousId: investment.previousInvestmentId,
      });
    }

    for (const dividend of tranferredDividends) {
      transferredOrigins.push({
        newId: dividend.newDividendId,
        previousId: dividend.previousDividendId,
      });
    }

    return api.transferShares(profileId, transferFromAccount, transferToAccount, transferredOrigins);
  }

  async transferDividends(profileId: UUID, transferFromAccount: UUID, transferToAccount: UUID): Promise<TransferredDividends[]> {
    const api = this.sharesAndDividendsModule.api();

    return api.transferDividends(profileId, transferFromAccount, transferToAccount);
  }
}

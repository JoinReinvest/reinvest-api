import { UUID } from 'HKEKTypes/Generics';
import { VerificationReference } from 'Investments/Domain/Investments/Fee';
import { Money } from 'Money/Money';
import { Verification } from 'Verification/index';

export type InvestmentFee = {
  amount: Money;
  verificationFeeId: UUID;
};

/**
 * Verification Module ACL
 */
export class VerificationService {
  private verificationModule: Verification.Main;

  constructor(verificationModule: Verification.Main) {
    this.verificationModule = verificationModule;
  }

  public static getClassName = () => 'VerificationService';

  async payFeesForInvestment(investmentAmount: Money, profileId: UUID, accountId: UUID): Promise<InvestmentFee[]> {
    const fees = await this.verificationModule.api().payFeesForInvestment(investmentAmount.getAmount(), profileId, accountId);

    return fees.map(fee => ({
      amount: Money.lowPrecision(fee.amount),
      verificationFeeId: fee.verificationFeeId,
    }));
  }

  async withdrawFees(fees: VerificationReference[]): Promise<void> {
    const feesToWithdraw = fees.map(fee => ({
      verificationFeeId: fee.verificationFeeId,
      amount: fee.amount,
    }));

    await this.verificationModule.api().withdrawFees(feesToWithdraw);
  }
}

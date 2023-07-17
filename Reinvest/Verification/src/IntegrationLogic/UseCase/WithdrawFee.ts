import { Money } from 'Money/Money';
import { VerificationFeesRepository } from 'Verification/Adapter/Database/Repository/VerificationFeesRepository';
import { InvestmentFee } from 'Verification/Domain/ValueObject/Fee';

export class WithdrawFee {
  private verificationFeeRepository: VerificationFeesRepository;

  constructor(verificationFeeRepository: VerificationFeesRepository) {
    this.verificationFeeRepository = verificationFeeRepository;
  }

  static getClassName = () => 'WithdrawFee';

  async execute(fees: InvestmentFee[]): Promise<void> {
    const feesIds = fees.map(fee => fee.verificationFeeId);

    if (feesIds.length === 0) {
      return;
    }

    const feesToWithdraw = await this.verificationFeeRepository.getFeesByIds(feesIds);

    for (const fee of fees) {
      const feeId = fee.verificationFeeId;
      const feeToWithdraw = feesToWithdraw.find(fee => fee.getId() === feeId);

      if (!feeToWithdraw) {
        continue;
      }

      const amount = Money.lowPrecision(fee.amount);
      feeToWithdraw.withdraw(amount);
    }

    await this.verificationFeeRepository.updateVerificationFees(feesToWithdraw);
  }
}

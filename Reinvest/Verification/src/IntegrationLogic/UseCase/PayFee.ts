import { UUID } from 'HKEKTypes/Generics';
import { Money } from 'Money/Money';
import { VerificationFeesRepository } from 'Verification/Adapter/Database/Repository/VerificationFeesRepository';

const MAX_EXTRA_TRANSFER_FEE_PERCENT = 0.06; // 6%

export type InvestmentFee = {
  amount: number;
  verificationFeeId: UUID;
};

export class PayFee {
  private verificationFeeRepository: VerificationFeesRepository;

  constructor(verificationFeeRepository: VerificationFeesRepository) {
    this.verificationFeeRepository = verificationFeeRepository;
  }

  static getClassName = () => 'PayFee';

  async execute(forInvestmentAmount: Money, profileId: UUID, accountId: UUID): Promise<InvestmentFee[]> {
    const unassignedFees = await this.verificationFeeRepository.getNotAssignedFees(profileId, accountId);

    if (unassignedFees.length === 0) {
      return [];
    }

    const fees = <InvestmentFee[]>[];

    let remainingAmount = forInvestmentAmount.multiplyBy(MAX_EXTRA_TRANSFER_FEE_PERCENT);

    for (const unassignedFee of unassignedFees) {
      if (remainingAmount.isZero()) {
        break;
      }

      const paidFee = unassignedFee.payToInvestmentAmount(remainingAmount);

      if (paidFee.isZero()) {
        continue;
      }

      fees.push({
        amount: paidFee.getAmount(),
        verificationFeeId: unassignedFee.getId(),
      });
      remainingAmount = remainingAmount.subtract(paidFee);
    }

    await this.verificationFeeRepository.updateVerificationFees(unassignedFees);

    return fees;
  }
}

import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { Fee, VerificationFeeIds } from 'Investments/Domain/Investments/Fee';
import { VerificationService } from 'Investments/Infrastructure/Adapters/Modules/VerificationService';
import { Money } from 'Money/Money';

export class InvestmentFeeService {
  static getClassName = (): string => 'InvestmentFeeService';
  private verificationService: VerificationService;
  private idGenerator: IdGeneratorInterface;

  constructor(verificationService: VerificationService, idGenerator: IdGeneratorInterface) {
    this.verificationService = verificationService;
    this.idGenerator = idGenerator;
  }

  async calculateFee(amount: Money, profileId: UUID, accountId: UUID, investmentId: UUID): Promise<Fee | null> {
    const fees = await this.verificationService.payFeesForInvestment(amount, profileId, accountId);

    if (fees.length === 0) {
      return null;
    }

    let feeAmount = Money.zero();
    const feesReferences: VerificationFeeIds = {
      fees: [],
    };

    for (const fee of fees) {
      feeAmount = feeAmount.add(fee.amount);
      feesReferences.fees.push({
        amount: fee.amount.getAmount(),
        verificationFeeId: fee.verificationFeeId,
      });
    }

    if (feeAmount.isZero()) {
      return null;
    }

    const feeId = this.idGenerator.createUuid();

    return Fee.create(accountId, feeAmount, feeId, investmentId, profileId, feesReferences);
  }
}

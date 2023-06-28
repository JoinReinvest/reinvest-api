import { UUID } from 'HKEKTypes/Generics';
import { Money } from 'Money/Money';
import { InvestmentFee, PayFee } from 'Verification/IntegrationLogic/UseCase/PayFee';

export class VerificationFeesController {
  private payFeeUseCase: PayFee;

  constructor(payFeeUseCase: PayFee) {
    this.payFeeUseCase = payFeeUseCase;
  }

  public static getClassName = (): string => 'VerificationFeesController';

  public async payFeesForInvestment(investmentAmount: number, profileId: UUID, accountId: UUID): Promise<InvestmentFee[]> {
    return this.payFeeUseCase.execute(Money.lowPrecision(investmentAmount), profileId, accountId);
  }
}

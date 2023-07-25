import { UUID } from 'HKEKTypes/Generics';
import { Money } from 'Money/Money';
import { InvestmentFee } from 'Verification/Domain/ValueObject/Fee';
import { PayFee } from 'Verification/IntegrationLogic/UseCase/PayFee';
import { WithdrawFee } from 'Verification/IntegrationLogic/UseCase/WithdrawFee';

export class VerificationFeesController {
  private payFeeUseCase: PayFee;
  private withdrawFeeUseCase: WithdrawFee;

  constructor(payFeeUseCase: PayFee, withdrawFeeUseCase: WithdrawFee) {
    this.payFeeUseCase = payFeeUseCase;
    this.withdrawFeeUseCase = withdrawFeeUseCase;
  }

  public static getClassName = (): string => 'VerificationFeesController';

  public async payFeesForInvestment(investmentAmount: number, profileId: UUID, accountId: UUID): Promise<InvestmentFee[]> {
    return this.payFeeUseCase.execute(Money.lowPrecision(investmentAmount), profileId, accountId);
  }

  public async withdrawFees(fees: InvestmentFee[]): Promise<void> {
    await this.withdrawFeeUseCase.execute(fees);
  }
}

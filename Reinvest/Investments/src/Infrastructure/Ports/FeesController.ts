import { UUID } from 'HKEKTypes/Generics';
import ApproveFees from 'Investments/Application/UseCases/ApproveFees';
import IsFeeApproved from 'Investments/Application/UseCases/IsFeeApproved';
import { Money } from 'Money/Money';
import { InvestmentFee, PayFee } from 'Verification/IntegrationLogic/UseCase/PayFee';

export class FeesController {
  private approveFeesUseCase: ApproveFees;
  private isFeeApprovedUseCase: IsFeeApproved;
  private payFeeUseCase: PayFee;

  constructor(approveFeesUseCase: ApproveFees, isFeeApprovedUseCase: IsFeeApproved, payFeeUseCase: PayFee) {
    this.approveFeesUseCase = approveFeesUseCase;
    this.isFeeApprovedUseCase = isFeeApprovedUseCase;
    this.payFeeUseCase = payFeeUseCase;
  }

  public static getClassName = (): string => 'FeesController';

  public async approveFees(profileId: string, investmentId: string) {
    return this.approveFeesUseCase.execute(profileId, investmentId);
  }

  public async isFeesApproved(investmentId: string) {
    return this.isFeeApprovedUseCase.execute(investmentId);
  }

  public async payFeesForInvestment(investmentAmount: number, profileId: UUID, accountId: UUID): Promise<InvestmentFee[]> {
    return this.payFeeUseCase.execute(Money.lowPrecision(investmentAmount), profileId, accountId);
  }
}

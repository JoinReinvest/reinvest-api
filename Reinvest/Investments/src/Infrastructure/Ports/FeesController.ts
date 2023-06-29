import ApproveFees from 'Investments/Application/UseCases/ApproveFees';
import IsFeeApproved from 'Investments/Application/UseCases/IsFeeApproved';

export class FeesController {
  private approveFeesUseCase: ApproveFees;
  private isFeeApprovedUseCase: IsFeeApproved;

  constructor(approveFeesUseCase: ApproveFees, isFeeApprovedUseCase: IsFeeApproved) {
    this.approveFeesUseCase = approveFeesUseCase;
    this.isFeeApprovedUseCase = isFeeApprovedUseCase;
  }

  public static getClassName = (): string => 'FeesController';

  public async approveFees(profileId: string, investmentId: string, ip: string) {
    return this.approveFeesUseCase.execute(profileId, investmentId, ip);
  }

  public async isFeesApproved(investmentId: string) {
    return this.isFeeApprovedUseCase.execute(investmentId);
  }
}

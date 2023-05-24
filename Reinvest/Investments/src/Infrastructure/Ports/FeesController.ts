import ApproveFees from '../../Application/UseCases/ApproveFees';

export class FeesController {
  private approveFeesUseCase: ApproveFees;

  constructor(approveFeesUseCase: ApproveFees) {
    this.approveFeesUseCase = approveFeesUseCase;
  }

  public static getClassName = (): string => 'FeesController';

  public async approveFees(profileId: string, investmentId: string) {
    return await this.approveFeesUseCase.execute(profileId, investmentId);
  }
}

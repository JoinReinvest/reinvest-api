import CreateInvestment from '../UseCases/CreateInvestment';

export class InvestmentsController {
  private createInvestmentUseCase: CreateInvestment;

  constructor(createInvestmentUseCase: CreateInvestment) {
    this.createInvestmentUseCase = createInvestmentUseCase;
  }

  public static getClassName = (): string => 'InvestmentsController';

  public async createInvestment(profileId: string, accountId: string, money: number) {
    return this.createInvestmentUseCase.execute(profileId, accountId, money);
  }
}

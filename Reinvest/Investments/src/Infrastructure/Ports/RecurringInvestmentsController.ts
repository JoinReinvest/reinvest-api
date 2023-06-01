import CreateRecurringInvestment from 'Investments/Application/UseCases/CreateRecurringInvestment';
import { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { Money } from 'Money/Money';
import type { USDInput } from 'Reinvest/ApiGateway/src/Schema/Types/Investments';
import GetRecurringInvestment from 'Reinvest/Investments/src/Application/UseCases/GetRecurringInvestment';

export class RecurringInvestmentsController {
  private createRecurringInvestmentUseCase: CreateRecurringInvestment;
  private getRecurringInvestmentUseCase: GetRecurringInvestment;

  constructor(createRecurringInvestmentUseCase: CreateRecurringInvestment, getRecurringInvestmentUseCase: GetRecurringInvestment) {
    this.createRecurringInvestmentUseCase = createRecurringInvestmentUseCase;
    this.getRecurringInvestmentUseCase = getRecurringInvestmentUseCase;
  }

  public static getClassName = (): string => 'RecurringInvestmentsController';

  public async createRecurringInvestment(portfolioId: string, profileId: string, accountId: string, money: USDInput, schedule: any) {
    const amount = new Money(money.value);

    return await this.createRecurringInvestmentUseCase.execute(portfolioId, profileId, accountId, amount, schedule);
  }

  public async getRecurringInvestment(accountId: string, status: RecurringInvestmentStatus) {
    return await this.getRecurringInvestmentUseCase.execute(accountId, status);
  }
}

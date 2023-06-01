import AssignSubscriptionAgreementToRecurringInvestment from 'Investments/Application/UseCases/AssignSubscriptionAgreementToRecurringInvestment';
import CreateRecurringInvestment from 'Investments/Application/UseCases/CreateRecurringInvestment';
import DeleteRecurringInvestment from 'Investments/Application/UseCases/DeleteRecurringInvestment';
import { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { Money } from 'Money/Money';
import type { USDInput } from 'Reinvest/ApiGateway/src/Schema/Types/Investments';
import RecurringInvestmentQuery from 'Reinvest/Investments/src/Application/UseCases/RecurringInvestmentQuery';

export class RecurringInvestmentsController {
  private createRecurringInvestmentUseCase: CreateRecurringInvestment;
  private getRecurringInvestmentQueryUseCase: RecurringInvestmentQuery;
  private deleteRecurringInvestmentUseCase: DeleteRecurringInvestment;
  private assignSubscriptionAgreementToRecurringInvestmentUseCase: AssignSubscriptionAgreementToRecurringInvestment;

  constructor(
    createRecurringInvestmentUseCase: CreateRecurringInvestment,
    getRecurringInvestmentQueryUseCase: RecurringInvestmentQuery,
    deleteRecurringInvestmentUseCase: DeleteRecurringInvestment,
    assignSubscriptionAgreementToRecurringInvestmentUseCase: AssignSubscriptionAgreementToRecurringInvestment,
  ) {
    this.createRecurringInvestmentUseCase = createRecurringInvestmentUseCase;
    this.getRecurringInvestmentQueryUseCase = getRecurringInvestmentQueryUseCase;
    this.deleteRecurringInvestmentUseCase = deleteRecurringInvestmentUseCase;
    this.assignSubscriptionAgreementToRecurringInvestmentUseCase = assignSubscriptionAgreementToRecurringInvestmentUseCase;
  }

  public static getClassName = (): string => 'RecurringInvestmentsController';

  public async createRecurringInvestment(portfolioId: string, profileId: string, accountId: string, money: USDInput, schedule: any) {
    const amount = new Money(money.value);

    return await this.createRecurringInvestmentUseCase.execute(portfolioId, profileId, accountId, amount, schedule);
  }

  public async assignSubscriptionAgreementToRecurringInvestment(accountId: string, subscriptionAgreementId: string) {
    return await this.assignSubscriptionAgreementToRecurringInvestmentUseCase.execute(accountId, subscriptionAgreementId);
  }

  public async getRecurringInvestment(accountId: string, status: RecurringInvestmentStatus) {
    return await this.getRecurringInvestmentQueryUseCase.execute(accountId, status);
  }

  public async deleteRecurringInvestment(profileId: string, accountId: string, status: RecurringInvestmentStatus) {
    return await this.deleteRecurringInvestmentUseCase.execute(profileId, accountId, status);
  }
}

import DeactivateRecurringInvestment from 'Investments/Application/UseCases/DeactivateRecurringInvestment';
import InitiateRecurringInvestment from 'Investments/Application/UseCases/InitiateRecurringInvestment';
import UnsuspendRecurringInvestment from 'Investments/Application/UseCases/UnsuspendRecurringInvestment';
import { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { Money } from 'Money/Money';
import type { USDInput } from 'Reinvest/ApiGateway/src/Schema/Types/Investments';
import CreateDraftRecurringInvestment from 'Reinvest/Investments/src/Application/UseCases/CreateDraftRecurringInvestment';
import RecurringInvestmentQuery from 'Reinvest/Investments/src/Application/UseCases/RecurringInvestmentQuery';

export class RecurringInvestmentsController {
  private createDraftRecurringInvestmentUseCase: CreateDraftRecurringInvestment;
  private getRecurringInvestmentQueryUseCase: RecurringInvestmentQuery;
  private initiateRecurringInvestmentUseCase: InitiateRecurringInvestment;
  private deactivateRecurringInvestmentUseCase: DeactivateRecurringInvestment;
  private unsuspendRecurringInvestmentUseCase: UnsuspendRecurringInvestment;

  constructor(
    createDraftRecurringInvestmentUseCase: CreateDraftRecurringInvestment,
    getRecurringInvestmentQueryUseCase: RecurringInvestmentQuery,
    initiateRecurringInvestmentUseCase: InitiateRecurringInvestment,
    deactivateRecurringInvestmentUseCase: DeactivateRecurringInvestment,
    unsuspendRecurringInvestmentUseCase: UnsuspendRecurringInvestment,
  ) {
    this.createDraftRecurringInvestmentUseCase = createDraftRecurringInvestmentUseCase;
    this.getRecurringInvestmentQueryUseCase = getRecurringInvestmentQueryUseCase;
    this.initiateRecurringInvestmentUseCase = initiateRecurringInvestmentUseCase;
    this.deactivateRecurringInvestmentUseCase = deactivateRecurringInvestmentUseCase;
    this.unsuspendRecurringInvestmentUseCase = unsuspendRecurringInvestmentUseCase;
  }

  public static getClassName = (): string => 'RecurringInvestmentsController';

  public async createDraftRecurringInvestment(portfolioId: string, profileId: string, accountId: string, money: USDInput, schedule: any) {
    const amount = new Money(money.value);

    return await this.createDraftRecurringInvestmentUseCase.execute(portfolioId, profileId, accountId, amount, schedule);
  }

  public async getRecurringInvestment(accountId: string, status: RecurringInvestmentStatus) {
    return await this.getRecurringInvestmentQueryUseCase.execute(accountId, status);
  }

  public async initiateRecurringInvestment(accountId: string) {
    return await this.initiateRecurringInvestmentUseCase.execute(accountId);
  }

  public async deactivateRecurringInvestment(accountId: string) {
    return await this.deactivateRecurringInvestmentUseCase.execute(accountId);
  }

  public async unsuspendRecurringInvestment(accountId: string) {
    return await this.unsuspendRecurringInvestmentUseCase.execute(accountId);
  }
}

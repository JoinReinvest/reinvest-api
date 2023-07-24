import { Pagination, UUID } from 'HKEKTypes/Generics';
import { CreateInvestmentFromRecurringInvestment } from 'Investments/Application/UseCases/CreateInvestmentFromRecurringInvestment';
import DeactivateRecurringInvestment from 'Investments/Application/UseCases/DeactivateRecurringInvestment';
import InitiateRecurringInvestment from 'Investments/Application/UseCases/InitiateRecurringInvestment';
import UnsuspendRecurringInvestment from 'Investments/Application/UseCases/UnsuspendRecurringInvestment';
import { RecurringInvestmentFrequency, RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import type { USDInput } from 'Reinvest/ApiGateway/src/Schema/Types/Investments';
import CreateDraftRecurringInvestment from 'Reinvest/Investments/src/Application/UseCases/CreateDraftRecurringInvestment';
import RecurringInvestmentQuery, { RecurringInvestmentView } from 'Reinvest/Investments/src/Application/UseCases/RecurringInvestmentQuery';

export class RecurringInvestmentsController {
  private createDraftRecurringInvestmentUseCase: CreateDraftRecurringInvestment;
  private recurringInvestmentQuery: RecurringInvestmentQuery;
  private initiateRecurringInvestmentUseCase: InitiateRecurringInvestment;
  private deactivateRecurringInvestmentUseCase: DeactivateRecurringInvestment;
  private unsuspendRecurringInvestmentUseCase: UnsuspendRecurringInvestment;
  private createInvestmentFromRecurringInvestmentUseCase: CreateInvestmentFromRecurringInvestment;

  constructor(
    createDraftRecurringInvestmentUseCase: CreateDraftRecurringInvestment,
    recurringInvestmentQuery: RecurringInvestmentQuery,
    initiateRecurringInvestmentUseCase: InitiateRecurringInvestment,
    deactivateRecurringInvestmentUseCase: DeactivateRecurringInvestment,
    unsuspendRecurringInvestmentUseCase: UnsuspendRecurringInvestment,
    createInvestmentFromRecurringInvestmentUseCase: CreateInvestmentFromRecurringInvestment,
  ) {
    this.createDraftRecurringInvestmentUseCase = createDraftRecurringInvestmentUseCase;
    this.recurringInvestmentQuery = recurringInvestmentQuery;
    this.initiateRecurringInvestmentUseCase = initiateRecurringInvestmentUseCase;
    this.deactivateRecurringInvestmentUseCase = deactivateRecurringInvestmentUseCase;
    this.unsuspendRecurringInvestmentUseCase = unsuspendRecurringInvestmentUseCase;
    this.createInvestmentFromRecurringInvestmentUseCase = createInvestmentFromRecurringInvestmentUseCase;
  }

  public static getClassName = (): string => 'RecurringInvestmentsController';

  public async createDraftRecurringInvestment(
    portfolioId: UUID,
    profileId: UUID,
    accountId: UUID,
    money: USDInput,
    schedule: {
      frequency: RecurringInvestmentFrequency;
      startDate: string;
    },
  ): Promise<boolean> {
    const amount = new Money(money.value);
    const startDate = DateTime.fromIsoDate(schedule.startDate);

    return this.createDraftRecurringInvestmentUseCase.execute(portfolioId, profileId, accountId, amount, schedule.frequency, startDate);
  }

  public async getRecurringInvestment(profileId: UUID, accountId: UUID, status: RecurringInvestmentStatus): Promise<RecurringInvestmentView | null> {
    return this.recurringInvestmentQuery.getRecurringInvestment(profileId, accountId, status);
  }

  public async initiateRecurringInvestment(profileId: UUID, accountId: UUID): Promise<boolean> {
    return this.initiateRecurringInvestmentUseCase.execute(profileId, accountId);
  }

  public async deactivateRecurringInvestment(profileId: UUID, accountId: UUID): Promise<boolean> {
    return this.deactivateRecurringInvestmentUseCase.execute(profileId, accountId);
  }

  public async unsuspendRecurringInvestment(profileId: UUID, accountId: UUID): Promise<boolean> {
    return this.unsuspendRecurringInvestmentUseCase.execute(profileId, accountId);
  }

  public async createInvestmentFromRecurringInvestment(recurringInvestmentId: UUID, bankAccountId: UUID, parentId: UUID | null): Promise<void> {
    await this.createInvestmentFromRecurringInvestmentUseCase.execute(recurringInvestmentId, bankAccountId, parentId);
  }

  public async getRecurringInvestmentsToCreate(pagination: Pagination): Promise<
    {
      accountId: UUID;
      id: UUID;
      profileId: UUID;
    }[]
  > {
    return this.recurringInvestmentQuery.listRecurringInvestmentsReadyToExecute(pagination);
  }
}

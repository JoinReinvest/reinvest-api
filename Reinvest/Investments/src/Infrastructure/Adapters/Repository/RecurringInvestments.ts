import { InvestmentsDatabaseAdapterProvider, recurringInvestmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import type { RecurringInvestmentCreate } from 'Reinvest/Investments/src/Application/UseCases/CreateRecurringInvestment';
import { RecurringInvestment } from 'Reinvest/Investments/src/Domain/Investments/RecurringInvestment';
import { RecurringInvestmentStatus } from 'Reinvest/Investments/src/Domain/Investments/Types';

export class RecurringInvestmentsRepository {
  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'RecurringInvestmentsRepository';

  async get(accountId: string, status: RecurringInvestmentStatus) {
    const recurringInvestment = await this.databaseAdapterProvider
      .provide()
      .selectFrom(recurringInvestmentsTable)
      .select(['accountId', 'amount', 'dateCreated', 'frequency', 'id', 'portfolioId', 'profileId', 'startDate', 'status', 'subscriptionAgreementId'])
      .where('accountId', '=', accountId)
      .where('status', '=', status)
      .executeTakeFirst();

    if (!recurringInvestment) {
      return null;
    }

    return RecurringInvestment.create(recurringInvestment);
  }

  async create(recurringInvestment: RecurringInvestmentCreate) {
    const { id, accountId, profileId, portfolioId, money, startDate, frequency, status } = recurringInvestment;
    const amount = money.getAmount();

    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(recurringInvestmentsTable)
        .values({
          accountId,
          amount,
          dateCreated: new Date(),
          frequency,
          id,
          portfolioId,
          profileId,
          startDate: new Date(startDate),
          status,
          subscriptionAgreementId: null,
        })
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create recurring investment: ${error.message}`, error);

      return false;
    }
  }

  async delete(accountId: string, profileId: string) {
    try {
      await this.databaseAdapterProvider
        .provide()
        .deleteFrom(recurringInvestmentsTable)
        .where('accountId', '=', accountId)
        .where('profileId', '=', profileId)
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot delete recurring investment: ${error.message}`, error);

      return false;
    }
  }
}

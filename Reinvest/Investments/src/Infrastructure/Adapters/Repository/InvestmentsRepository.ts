import { InvestmentsDatabaseAdapterProvider, investmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import type { InvestmentCreate } from 'Investments/Infrastructure/UseCases/CreateInvestment';
import type { Money } from 'Money/Money';

export class InvestmentsRepository {
  public static getClassName = (): string => 'InvestmentsRepository';

  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  async create(investment: InvestmentCreate, money: Money) {
    const { id, profileId, accountId, scheduledBy, status } = investment;
    const amount = money.getAmount();
    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(investmentsTable)
        .values({
          id,
          profileId,
          amount,
          accountId,
          dateCreated: new Date(),
          dateUpdated: new Date(),
          subscriptionAgreementId: null,
          scheduledBy,
          recurringInvestmentId: null,
          status,
        })
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create investment: ${error.message}`, error);

      return false;
    }
  }
}

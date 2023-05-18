import { InvestmentsDatabaseAdapterProvider, investmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';

import type { InvestmentCreate } from '../../UseCases/CreateInvestment';

export class InvestmentsRepository {
  public static getClassName = (): string => 'InvestmentsRepository';

  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  async create(investment: InvestmentCreate) {
    const { id, profileId, amount, accountId, scheduledBy, status } = investment;
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

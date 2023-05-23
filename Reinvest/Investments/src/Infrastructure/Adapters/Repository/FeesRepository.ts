import { InvestmentsDatabaseAdapterProvider, investmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import type { InvestmentCreate } from 'Investments/Infrastructure/UseCases/CreateInvestment';
import { Investment } from 'Investments/Infrastructure/ValueObject/Investment';
import type { Money } from 'Money/Money';

export class FeesRepository {
  public static getClassName = (): string => 'FeesRepository';

  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  async get(investmentId: string) {
    const investment = await this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentsTable)
      .select([
        'accountId',
        'amount',
        'bankAccountId',
        'dateCreated',
        'dateUpdated',
        'id',
        'profileId',
        'recurringInvestmentId',
        'scheduledBy',
        'status',
        'subscriptionAgreementId',
      ])
      .where('id', '=', investmentId)
      .executeTakeFirst();

    if (!investment) return false;

    return Investment.create(investment);
  }

  async create(investment: InvestmentCreate, money: Money) {
    const { id, profileId, accountId, bankAccountId, scheduledBy, status } = investment;
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
          bankAccountId,
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

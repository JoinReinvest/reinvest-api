import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { sadSharesTable, SharesAndDividendsDatabaseAdapterProvider } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { SharesAndTheirPricesSelection, SharesTable } from 'SharesAndDividends/Adapter/Database/SharesAndDividendsSchema';
import { SharesAndTheirPrices } from 'SharesAndDividends/Domain/AccountStatsCalculationService';
import { NumberOfSharesPerDay } from 'SharesAndDividends/Domain/Dividends/DividendDeclaration';
import { Shares, SharesSchema, SharesStatus } from 'SharesAndDividends/Domain/Shares';

export class SharesRepository {
  private databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'SharesRepository';

  async store(shares: Shares) {
    const values = <SharesTable>shares.toObject();

    await this.databaseAdapterProvider
      .provide()
      .insertInto(sadSharesTable)
      .values(values)
      .onConflict(oc =>
        oc.column('investmentId').doUpdateSet({
          dateFunded: eb => eb.ref(`excluded.dateFunded`),
          dateRevoked: eb => eb.ref(`excluded.dateRevoked`),
          dateSettled: eb => eb.ref(`excluded.dateSettled`),
          numberOfShares: eb => eb.ref(`excluded.numberOfShares`),
          status: eb => eb.ref(`excluded.status`),
          unitPrice: eb => eb.ref(`excluded.unitPrice`),
        }),
      )
      .execute();
  }

  async getNotRevokedSharesAndTheirPrice(
    profileId: string,
    accountId: string,
  ): Promise<{
    [portfolioId: string]: SharesAndTheirPrices[];
  }> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadSharesTable)
      .select(['numberOfShares', 'price', 'unitPrice', 'portfolioId'])
      .where('profileId', '=', profileId)
      .where('accountId', '=', accountId)
      .where('status', '!=', SharesStatus.REVOKED)
      .castTo<SharesAndTheirPricesSelection>()
      .execute();

    const sharesPerPortfolio: { [portfolioId: string]: SharesAndTheirPrices[] } = {};

    if (!data) {
      return sharesPerPortfolio;
    }

    data.map((sharesAndTheirPrices: SharesAndTheirPricesSelection) => {
      const { portfolioId, numberOfShares, unitPrice, price } = sharesAndTheirPrices;

      if (!sharesPerPortfolio[portfolioId]) {
        sharesPerPortfolio[portfolioId] = [];
      }

      // @ts-ignore
      sharesPerPortfolio[portfolioId].push({
        numberOfShares,
        unitPrice: unitPrice ? new Money(unitPrice) : null,
        price: new Money(price),
      });
    });

    return sharesPerPortfolio;
  }

  async getSharesByInvestmentId(investmentId: string): Promise<Shares | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadSharesTable)
      .select([
        'accountId',
        'dateCreated',
        'dateFunded',
        'dateRevoked',
        'dateSettled',
        'id',
        'investmentId',
        'numberOfShares',
        'portfolioId',
        'price',
        'profileId',
        'status',
        'unitPrice',
      ])
      .where('investmentId', '=', investmentId)
      .castTo<SharesSchema>()
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return Shares.restore(data);
  }

  async getFirstSharesCreatedDate(): Promise<DateTime | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadSharesTable)
      .select(['dateCreated'])
      .orderBy('dateCreated', 'asc')
      .limit(1)
      .executeTakeFirst();

    return !data ? null : DateTime.fromIsoDate(data.dateCreated);
  }

  async getAccumulativeNumberOfSharesPerDay(portfolioId: string, calculatedFromDate: DateTime, calculatedToDate: DateTime): Promise<NumberOfSharesPerDay> {
    const sharesPerDay = await this.getNumberOfSharesPerDay(portfolioId, calculatedFromDate, calculatedToDate);
    const notRevokedSharesBefore = await this.getNumberOfNotRevokedSharesBefore(portfolioId, calculatedFromDate);
    const revokedSharesPerDay = await this.getRevokedSharesPerDay(portfolioId, calculatedFromDate, calculatedToDate);

    const days = {};
    const toDate = calculatedToDate.getInstance();
    let currentDate = calculatedFromDate.getInstance();
    let currentNumberOfShares = notRevokedSharesBefore;

    do {
      const dateKey = currentDate.format('YYYY-MM-DD');
      // @ts-ignore
      currentNumberOfShares += sharesPerDay[dateKey] ? sharesPerDay[dateKey] : 0;
      // @ts-ignore
      currentNumberOfShares -= revokedSharesPerDay[dateKey] ? revokedSharesPerDay[dateKey] : 0;
      // @ts-ignore
      days[dateKey] = currentNumberOfShares;

      currentDate = currentDate.add(1, 'day');
    } while (!currentDate.isAfter(toDate));

    return {
      days,
    };
  }

  async getNumberOfNotRevokedSharesBefore(portfolioId: string, calculatedFromDate: DateTime): Promise<number> {
    const allSharesBefore = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadSharesTable)
      .select(eb => [eb.fn.sum('numberOfShares').as('shares')])
      .where('portfolioId', '=', portfolioId)
      .where('dateCreated', '<', <any>calculatedFromDate.toIsoDate())
      .where('status', '!=', SharesStatus.REVOKED)
      .executeTakeFirst();

    return allSharesBefore?.shares ? <number>allSharesBefore.shares : 0;
  }

  async getNumberOfSharesPerDay(
    portfolioId: string,
    calculatedFromDate: DateTime,
    calculatedToDate: DateTime,
  ): Promise<{
    [isoDate: string]: number;
  }> {
    const sharesInPeriod = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadSharesTable)
      .select(eb => [eb.fn('to_char', ['dateCreated', eb.val('yyyy-mm-dd')]).as('isoDate'), eb.fn.sum('numberOfShares').as('shares')])
      .where('portfolioId', '=', portfolioId)
      .where('dateCreated', '>=', <any>calculatedFromDate.toIsoDate())
      .where('dateCreated', '<=', <any>calculatedToDate.toIsoDate())
      .groupBy('isoDate')
      .orderBy('isoDate', 'asc')
      .execute();

    const days: { [isoDate: string]: number } = {};
    sharesInPeriod.map(record => {
      const index = <string>record.isoDate;
      // @ts-ignore
      days[index] = record.shares;
    });

    return days;
  }

  private async getRevokedSharesPerDay(
    portfolioId: string,
    calculatedFromDate: DateTime,
    calculatedToDate: DateTime,
  ): Promise<{
    [isoDate: string]: number;
  }> {
    const revokedSharesInPeriod = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadSharesTable)
      .select(eb => [eb.fn('to_char', ['dateRevoked', eb.val('yyyy-mm-dd')]).as('isoDate'), eb.fn.sum('numberOfShares').as('shares')])
      .where('portfolioId', '=', portfolioId)
      .where('dateRevoked', '>=', <any>calculatedFromDate.toIsoDate())
      .where('dateRevoked', '<=', <any>calculatedToDate.toIsoDate())
      .where('status', '=', SharesStatus.REVOKED)
      .groupBy('isoDate')
      .orderBy('isoDate', 'asc')
      .execute();

    const revokedDays: { [isoDate: string]: number } = {};
    revokedSharesInPeriod.map(record => {
      const index = <string>record.isoDate;
      // @ts-ignore
      revokedDays[index] = record.shares;
    });

    return revokedDays;
  }
}

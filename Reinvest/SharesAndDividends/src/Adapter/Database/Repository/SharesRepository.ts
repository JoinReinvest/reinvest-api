import { UUID } from 'HKEKTypes/Generics';
import { sql } from 'kysely';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { sadSharesTable, SharesAndDividendsDatabaseAdapterProvider } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { SharesAndTheirPricesSelection, SharesTable } from 'SharesAndDividends/Adapter/Database/SharesAndDividendsSchema';
import { NumberOfSharesPerDay } from 'SharesAndDividends/Domain/CalculatingDividends/DividendDeclaration';
import { Shares, SharesSchema, SharesStatus } from 'SharesAndDividends/Domain/Shares';
import { SharesAndTheirPrices } from 'SharesAndDividends/Domain/Stats/AccountStatsCalculationService';

export class SharesRepository {
  private databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'SharesRepository';

  async store(shares: Shares | Shares[]) {
    const sharesToStore = !Array.isArray(shares) ? [shares] : shares;
    const values = sharesToStore.map(shares => <SharesTable>shares.toObject());

    await this.databaseAdapterProvider
      .provide()
      .insertInto(sadSharesTable)
      .values(values)
      .onConflict(oc =>
        oc.constraint('shares_unique_origin_id').doUpdateSet({
          dateFunded: eb => eb.ref(`excluded.dateFunded`),
          dateFunding: eb => eb.ref(`excluded.dateFunding`),
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

  async getSharesByOriginId(originId: string): Promise<Shares | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadSharesTable)
      .selectAll()
      .where('originId', '=', originId)
      .castTo<SharesSchema>()
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return Shares.restore(data);
  }

  async getFirstSharesFundingDate(): Promise<DateTime | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadSharesTable)
      .select(['dateFunding'])
      .orderBy('dateFunding', 'asc')
      .limit(1)
      .executeTakeFirst();

    return !data ? null : DateTime.fromIsoDate(data.dateFunding!);
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
      .where('dateFunding', '<', <any>calculatedFromDate.toIsoDate())
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
      .select(eb => [eb.fn('to_char', ['dateFunding', eb.val('yyyy-mm-dd')]).as('isoDate'), eb.fn.sum('numberOfShares').as('shares')])
      .where('portfolioId', '=', portfolioId)
      .where(sql`"dateFunding"::date >= ${calculatedFromDate.toIsoDate()}`)
      .where(sql`"dateFunding"::date <= ${calculatedToDate.toIsoDate()}`)
      .groupBy('isoDate')
      .orderBy('isoDate', 'asc')
      .execute();

    const days: { [isoDate: string]: number } = {};
    sharesInPeriod.map(record => {
      const index = <string>record.isoDate;
      // @ts-ignore
      days[index] = record?.shares ? record?.shares : 0;
    });

    return days;
  }

  async getSharesByIds(sharesIds: UUID[]): Promise<Shares[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadSharesTable)
      .selectAll()
      .where('id', 'in', sharesIds)
      .castTo<SharesSchema>()
      .execute();

    if (!data) {
      return [];
    }

    return data.map(Shares.restore);
  }

  async getCostOfSharesOwned(accountId: UUID, toDate: DateTime): Promise<Money> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadSharesTable)
      .select(eb => [eb.fn.sum('price').as('costOfSharesOwned')])
      .where('accountId', '=', accountId)
      .where(sql`"dateFunding"::date <= ${toDate.toIsoDate()}`)
      .where('status', '!=', SharesStatus.REVOKED)
      .executeTakeFirst();

    if (!data?.costOfSharesOwned) {
      return Money.zero();
    }

    return Money.lowPrecision(parseInt(<string>data.costOfSharesOwned));
  }

  async getSettledSharesForAccountState(profileId: string, accountId: string) {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadSharesTable)
      .select(['numberOfShares', 'dateFunding', 'unitPrice', 'id', 'portfolioId'])
      .where('profileId', '=', profileId)
      .where('accountId', '=', accountId)
      .where('status', '=', SharesStatus.SETTLED)
      .execute();

    if (!data) {
      return [];
    }

    return data;
  }

  async areThereNotSettledShares(profileId: string, accountId: string): Promise<boolean> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadSharesTable)
      .select(eb => [eb.fn.count('id').as('count')])
      .where('profileId', '=', profileId)
      .where('accountId', '=', accountId)
      .where('status', 'not in', [SharesStatus.SETTLED, SharesStatus.REVOKED])
      .executeTakeFirst();

    const areThereNotSettledShares = !data || parseInt(<string>data.count) === 0 ? false : true;

    return areThereNotSettledShares;
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

  async getAllAccountShares(profileId: UUID, accountId: UUID): Promise<Shares[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadSharesTable)
      .selectAll()
      .where('profileId', '=', profileId)
      .where('accountId', '=', accountId)
      .execute();

    if (!data) {
      return [];
    }

    return data.map(Shares.restore);
  }

  async transferShares(toStore: Shares[]): Promise<void> {
    const values = toStore.map(shares => <SharesTable>shares.toObject());

    await this.databaseAdapterProvider
      .provide()
      .insertInto(sadSharesTable)
      .values(values)
      .onConflict(oc =>
        oc.constraint('shares_unique_origin_id').doUpdateSet({
          accountId: eb => eb.ref(`excluded.accountId`),
        }),
      )
      .execute();
  }
}

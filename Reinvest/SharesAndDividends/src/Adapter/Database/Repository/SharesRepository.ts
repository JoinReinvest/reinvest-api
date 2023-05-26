import { Money } from 'Money/Money';
import { sadSharesTable, SharesAndDividendsDatabaseAdapterProvider } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { SharesAndTheirPricesSelection, SharesTable } from 'SharesAndDividends/Adapter/Database/SharesAndDividendsSchema';
import { SharesAndTheirPrices } from 'SharesAndDividends/Domain/AccountStatsCalculationService';
import { Shares, SharesStatus } from 'SharesAndDividends/Domain/Shares';

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
}

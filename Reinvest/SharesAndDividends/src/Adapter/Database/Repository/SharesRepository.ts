import { sadSharesTable, SharesAndDividendsDatabaseAdapterProvider } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { SharesTable } from 'SharesAndDividends/Adapter/Database/SharesAndDividendsSchema';
import { Shares } from 'SharesAndDividends/Domain/Shares';

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
}

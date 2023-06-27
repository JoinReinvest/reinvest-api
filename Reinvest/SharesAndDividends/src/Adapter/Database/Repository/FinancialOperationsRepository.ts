import {
  sadFinancialOperationsTable,
  sadGlobalFinancialOperationsTable,
  SharesAndDividendsDatabaseAdapterProvider,
} from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { FinancialOperationRecord, FinancialOperationType, GlobalFinancialOperationType } from 'SharesAndDividends/Domain/Stats/EVSDataPointsCalculatonService';

export class FinancialOperationsRepository {
  private databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'FinancialOperationsRepository';

  async addInvestmentOperation(
    operationType: FinancialOperationType,
    financialOperationId: string,
    profileId: string,
    accountId: string,
    portfolioId: string,
    numberOfShares: number,
    unitPrice: number,
    investmentId: string,
  ): Promise<void> {
    await this.databaseAdapterProvider
      .provide()
      .insertInto(sadFinancialOperationsTable)
      .values({
        id: financialOperationId,
        profileId,
        accountId,
        createdDate: new Date(),
        operationType,
        dataJson: {
          numberOfShares,
          unitPrice,
          portfolioId,
          investmentId,
        },
      })
      .execute();
  }

  async navChangedOperation(financialOperationId: string, numberOfShares: number, unitPrice: number, portfolioId: string): Promise<void> {
    await this.databaseAdapterProvider
      .provide()
      .insertInto(sadGlobalFinancialOperationsTable)
      .values({
        id: financialOperationId,
        createdDate: new Date(),
        operationType: GlobalFinancialOperationType.NAV_CHANGED,
        dataJson: {
          numberOfShares,
          unitPrice,
          portfolioId,
        },
      })
      .execute();
  }

  async getFinancialOperationsForAccount(profileId: string, accountId: string): Promise<FinancialOperationRecord[]> {
    const db = this.databaseAdapterProvider.provide();

    return await db
      .selectFrom(sadFinancialOperationsTable)
      .select([`createdDate`, `operationType`, `dataJson`])
      // @ts-ignore
      .unionAll(db.selectFrom(sadGlobalFinancialOperationsTable).select([`createdDate`, `operationType`, `dataJson`]))
      .where(`${sadFinancialOperationsTable}.accountId`, '=', accountId)
      .where(`${sadFinancialOperationsTable}.profileId`, '=', profileId)
      .orderBy('createdDate', 'asc')
      .castTo<FinancialOperationRecord>()
      .execute();
  }
}

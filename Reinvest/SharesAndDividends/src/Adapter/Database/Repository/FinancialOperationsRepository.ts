import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import {
  sadFinancialOperationsTable,
  sadGlobalFinancialOperationsTable,
  SharesAndDividendsDatabaseAdapterProvider,
} from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { FinancialOperationRecord, FinancialOperationType, GlobalFinancialOperationType } from 'SharesAndDividends/Domain/Stats/EVSDataPointsCalculatonService';

export type FinancialOperation = {
  accountId: UUID;
  numberOfShares: number;
  operationType: FinancialOperationType;
  originId: UUID;
  portfolioId: UUID;
  profileId: UUID;
  unitPrice: number;
  uniqueId?: UUID | null;
};

export class FinancialOperationsRepository {
  private databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider;
  private idGenerator: IdGeneratorInterface;

  constructor(databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider, idGenerator: IdGeneratorInterface) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.idGenerator = idGenerator;
  }

  public static getClassName = (): string => 'FinancialOperationsRepository';

  async addFinancialOperations(operations: FinancialOperation[]): Promise<void> {
    const values = operations.map((operation: FinancialOperation) => {
      const financialOperationId = this.idGenerator.createUuid();

      return {
        id: financialOperationId,
        profileId: operation.profileId,
        accountId: operation.accountId,
        createdDate: new Date(),
        operationType: operation.operationType,
        dataJson: {
          numberOfShares: operation.numberOfShares,
          unitPrice: operation.unitPrice,
          portfolioId: operation.portfolioId,
          originId: operation.originId,
        },
        uniqueId: operation.uniqueId ?? null,
      };
    });

    await this.databaseAdapterProvider
      .provide()
      .insertInto(sadFinancialOperationsTable)
      .values(values)
      .onConflict(oc => oc.column('uniqueId').doNothing())
      .execute();
  }

  async navChangedOperation(numberOfShares: number, unitPrice: number, portfolioId: string): Promise<void> {
    const financialOperationId = this.idGenerator.createUuid();

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

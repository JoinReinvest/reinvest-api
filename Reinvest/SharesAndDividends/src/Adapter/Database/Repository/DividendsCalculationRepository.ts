import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import {
  sadCalculatedDividendsTable,
  sadDividendsDeclarationsTable,
  sadSharesTable,
  SharesAndDividendsDatabaseAdapterProvider,
} from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { CalculatedDividendsTable, DividendsDeclarationTable } from 'SharesAndDividends/Adapter/Database/SharesAndDividendsSchema';
import { CalculatedDividend } from 'SharesAndDividends/Domain/Dividends/CalculatedDividend';
import { DividendDeclaration, DividendDeclarationStatus, NumberOfSharesPerDay } from 'SharesAndDividends/Domain/Dividends/DividendDeclaration';
import { SharesStatus } from 'SharesAndDividends/Domain/Shares';

export class DividendsCalculationRepository {
  private databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'DividendsCalculationRepository';

  async getLastDeclarationDate(): Promise<DateTime | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadDividendsDeclarationsTable)
      .select(['calculatedToDate'])
      .orderBy('calculatedToDate', 'desc')
      .limit(1)
      .executeTakeFirst();

    return !data ? null : DateTime.from(data.calculatedToDate);
  }

  async storeDividendDeclaration(dividendDeclaration: DividendDeclaration) {
    const { numberOfShares: numberOfSharesJson, ...schema } = dividendDeclaration.toObject();
    const values = <DividendsDeclarationTable>{
      ...schema,
      numberOfSharesJson,
    };

    await this.databaseAdapterProvider.provide().insertInto(sadDividendsDeclarationsTable).values(values).execute();
  }

  async getDividendDeclarations(): Promise<DividendDeclaration[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadDividendsDeclarationsTable)
      .selectAll()
      .orderBy('calculatedFromDate', 'asc')
      .execute();

    return data.map((declaration: DividendsDeclarationTable) => {
      return this.restoreDividendDeclaration(declaration)!;
    });
  }

  async getDividendDeclarationByDate(declarationDate: DateTime): Promise<DividendDeclaration | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadDividendsDeclarationsTable)
      .selectAll()
      .where('calculatedToDate', '=', <any>declarationDate.toIsoDate())
      .executeTakeFirst();

    return this.restoreDividendDeclaration(<DividendsDeclarationTable>data);
  }

  async getPendingDeclaration() {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadDividendsDeclarationsTable)
      .selectAll()
      .where('status', '=', DividendDeclarationStatus.CALCULATING)
      .orderBy('calculatedToDate', 'asc')
      .executeTakeFirst();

    return this.restoreDividendDeclaration(<DividendsDeclarationTable>data);
  }

  /**
   * Use indexes: sadCalculatedDividendsTable.declarationId, sadCalculatedDividendsTable.sharesId
   */
  async getSharesIdsToCalculate(portfolioId: UUID, declarationId: UUID, toDate: DateTime): Promise<UUID[]> {
    const dayAfterToDate = toDate.addDays(1);
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadSharesTable)
      .select([`${sadSharesTable}.id`])
      .leftJoin(sadCalculatedDividendsTable, `${sadSharesTable}.id`, `${sadCalculatedDividendsTable}.sharesId`)

      .where(`${sadSharesTable}.dateFunding`, '<', <any>dayAfterToDate.toIsoDate())
      .where(`${sadSharesTable}.portfolioId`, '=', portfolioId)
      .where(`${sadSharesTable}.status`, '!=', SharesStatus.REVOKED)
      .where(`${sadSharesTable}.status`, '!=', SharesStatus.CREATED)
      .where(qb =>
        qb.where(`${sadCalculatedDividendsTable}.declarationId`, 'is', null).orWhere(`${sadCalculatedDividendsTable}.declarationId`, '!=', declarationId),
      )
      .groupBy(`${sadSharesTable}.id`)
      .orderBy('dateFunding', 'asc')
      .limit(1000)
      .execute();

    return data.map((row: { id: string }) => row.id);
  }

  async getDividendDeclarationById(declarationId: UUID): Promise<DividendDeclaration | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadDividendsDeclarationsTable)
      .selectAll()
      .where('id', '=', declarationId)
      .executeTakeFirst();

    return this.restoreDividendDeclaration(<DividendsDeclarationTable>data);
  }

  async storeCalculatedDividends(calculatedDividends: CalculatedDividend[]) {
    const recordsToStore = calculatedDividends.map((calculatedDividend: CalculatedDividend): CalculatedDividendsTable => {
      const schema = calculatedDividend.toObject();

      return {
        accountId: schema.accountId,
        calculationDate: schema.calculationDate,
        declarationId: schema.declarationId,
        dividendAmount: schema.dividendAmount,
        feeAmount: schema.feeAmount,
        id: schema.id,
        numberOfDaysInvestorOwnsShares: schema.numberOfDaysInvestorOwnsShares,
        profileId: schema.profileId,
        sharesId: schema.sharesId,
        status: schema.status,
      };
    });

    await this.databaseAdapterProvider
      .provide()
      .insertInto(sadCalculatedDividendsTable)
      .values(recordsToStore)
      .onConflict(oc => oc.column('id').doNothing())
      .execute();
  }

  async getDividendDeclarationStats(declarationId: UUID) {
    return this.databaseAdapterProvider
      .provide()
      .selectFrom(sadCalculatedDividendsTable)
      .select(eb => [eb.fn.sum('dividendAmount').as('inDividends'), eb.fn.sum('feeAmount').as('inFees'), 'status'])
      .where('declarationId', '=', <any>declarationId)
      .groupBy('status')
      .execute();
  }

  private restoreDividendDeclaration(data: DividendsDeclarationTable): DividendDeclaration | null {
    if (!data) {
      return null;
    }

    const { numberOfSharesJson, ...schema } = data;

    return DividendDeclaration.restore({
      ...schema,
      numberOfShares: <NumberOfSharesPerDay>numberOfSharesJson,
    });
  }
}

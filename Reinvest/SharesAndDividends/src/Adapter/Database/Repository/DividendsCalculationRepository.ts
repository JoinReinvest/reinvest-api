import { JSONObjectOf, UUID } from 'HKEKTypes/Generics';
import { sql } from 'kysely';
import { DateTime } from 'Money/DateTime';
import {
  sadCalculatedDividendsTable,
  sadDividendDistributionTable,
  sadDividendsDeclarationsTable,
  sadInvestorDividendsTable,
  sadSharesTable,
  SharesAndDividendsDatabaseAdapterProvider,
} from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { CalculatedDividendsTable, DividendsDeclarationTable, InvestorDividendsTable } from 'SharesAndDividends/Adapter/Database/SharesAndDividendsSchema';
import { CalculatedDividend, CalculatedDividendSchema } from 'SharesAndDividends/Domain/CalculatingDividends/CalculatedDividend';
import { DividendDeclaration, DividendDeclarationStatus, NumberOfSharesPerDay } from 'SharesAndDividends/Domain/CalculatingDividends/DividendDeclaration';
import {
  DividendDistribution,
  DividendDistributionStatus,
  DividendsDistributionSchema,
} from 'SharesAndDividends/Domain/CalculatingDividends/DividendDistribution';
import { CalculatedDividendsList, InvestorDividend, InvestorDividendSchema, InvestorDividendStatus } from 'SharesAndDividends/Domain/InvestorDividend';
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
      .onConflict(oc =>
        oc.column('id').doUpdateSet({
          status: eb => eb.ref(`excluded.status`),
        }),
      )
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

  async getAccountsForDividendDistribution(createdBeforeDate: DateTime): Promise<UUID[]> {
    const accounts = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadCalculatedDividendsTable)
      .select(['accountId'])
      .where('status', '=', 'AWAITING_DISTRIBUTION')
      .where(sql`"calculationDate"::date <= ${createdBeforeDate.toIsoDate()}`)
      .groupBy('accountId')
      .limit(1000)
      .execute();

    return accounts.map((account: { accountId: string }) => account.accountId);
  }

  async getLastPendingDividendDistribution(): Promise<DividendDistribution | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadDividendDistributionTable)
      .selectAll()
      .where('status', '=', DividendDistributionStatus.DISTRIBUTING)
      .executeTakeFirst();

    return data ? DividendDistribution.restore(<DividendsDistributionSchema>data) : null;
  }

  async storeDividendDistribution(dividendDistribution: DividendDistribution): Promise<void> {
    const values = dividendDistribution.toObject();

    await this.databaseAdapterProvider
      .provide()
      .insertInto(sadDividendDistributionTable)
      .values(values)
      .onConflict(oc =>
        oc.column('id').doUpdateSet({
          status: values.status,
        }),
      )
      .execute();
  }

  async getDividendDistributionById(id: UUID): Promise<DividendDistribution | null> {
    const data = await this.databaseAdapterProvider.provide().selectFrom(sadDividendDistributionTable).selectAll().where('id', '=', id).executeTakeFirst();

    return data ? DividendDistribution.restore(<DividendsDistributionSchema>data) : null;
  }

  async getDividendsCalculationForAccount(accountId: UUID, distributeToDate: DateTime): Promise<CalculatedDividend[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadCalculatedDividendsTable)
      .selectAll()
      .where('accountId', '=', accountId)
      .where(sql`"calculationDate"::date <= ${distributeToDate.toIsoDate()}`)
      .where('status', '=', 'AWAITING_DISTRIBUTION')
      .execute();

    return data.map(
      (calculatedDividend: CalculatedDividendsTable): CalculatedDividend => CalculatedDividend.restore(<CalculatedDividendSchema>calculatedDividend),
    );
  }

  async getDividendWithNoCoveredFee(accountId: UUID): Promise<InvestorDividend | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadInvestorDividendsTable)
      .selectAll()
      .where('accountId', '=', accountId)
      .where('status', '=', <any>InvestorDividendStatus.FEES_NOT_COVERED)
      .executeTakeFirst();

    return this.restoreInvestorDividend(<InvestorDividendsTable>data);
  }

  async storeInvestorDividend(investorDividend: InvestorDividend): Promise<void> {
    const { calculatedDividends, ...schema } = investorDividend.toObject();
    const values = <InvestorDividendsTable>{
      calculatedDividendsJson: <JSONObjectOf<CalculatedDividendsList>>calculatedDividends,
      ...schema,
    };

    await this.databaseAdapterProvider
      .provide()
      .insertInto(sadInvestorDividendsTable)
      .values(values)
      .onConflict(oc =>
        oc.column('id').doUpdateSet({
          status: values.status,
          totalDividendAmount: values.totalDividendAmount,
          totalFeeAmount: values.totalFeeAmount,
          dividendAmount: values.dividendAmount,
          actionDate: values.actionDate,
          feesCoveredByDividendId: values.feesCoveredByDividendId,
        }),
      )
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

  private restoreInvestorDividend(data: InvestorDividendsTable): InvestorDividend | null {
    if (!data) {
      return null;
    }

    const { calculatedDividendsJson, ...schema } = data;
    const investorDividendSchema = <InvestorDividendSchema>{
      calculatedDividends: calculatedDividendsJson,
      ...schema,
    };

    return InvestorDividend.restore(investorDividendSchema);
  }
}

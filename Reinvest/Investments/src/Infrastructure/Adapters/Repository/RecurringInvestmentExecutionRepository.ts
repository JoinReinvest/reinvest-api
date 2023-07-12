import { UUID } from 'HKEKTypes/Generics';
import { RecurringInvestmentExecution, RecurringInvestmentExecutionSchema } from 'Investments/Domain/Investments/RecurringInvestmentExecution';
import { InvestmentsDatabaseAdapterProvider, recurringInvestmentsExecutionTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { RecurringInvestmentsExecutionTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';
import { DateTime } from 'Money/DateTime';

export class RecurringInvestmentExecutionRepository {
  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'RecurringInvestmentExecutionRepository';

  async getLastRecurringInvestmentExecution(recurringInvestmentExecutionId: UUID): Promise<RecurringInvestmentExecution | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(recurringInvestmentsExecutionTable)
      .selectAll()
      .where('recurringInvestmentId', '=', recurringInvestmentExecutionId)
      .orderBy('executionDate', 'desc')
      .limit(1)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return this.castToObject(data);
  }

  async store(recurringInvestmentExecution: RecurringInvestmentExecution) {
    const values = this.castToTable(recurringInvestmentExecution);

    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(recurringInvestmentsExecutionTable)
        .values(values)
        .onConflict(oc =>
          oc.column('investmentId').doUpdateSet({
            investmentStatus: eb => eb.ref(`excluded.investmentStatus`),
          }),
        )
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create recurring investment: ${error.message}`, error);

      return false;
    }
  }

  private castToObject(tableData: RecurringInvestmentsExecutionTable): RecurringInvestmentExecution {
    return RecurringInvestmentExecution.restore(<RecurringInvestmentExecutionSchema>{
      ...tableData,
      executionDate: DateTime.fromIsoDate(tableData.executionDate),
      dateCreated: DateTime.from(tableData.dateCreated),
    });
  }

  private castToTable(object: RecurringInvestmentExecution): RecurringInvestmentsExecutionTable {
    const data = object.toObject();

    return <RecurringInvestmentsExecutionTable>{
      ...data,
      executionDate: data.executionDate.toDate(),
      dateCreated: data.dateCreated.toDate(),
    };
  }

  async getByInvestmentId(investmentId: UUID): Promise<RecurringInvestmentExecution | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(recurringInvestmentsExecutionTable)
      .selectAll()
      .where('investmentId', '=', investmentId)
      .limit(1)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return this.castToObject(data);
  }

  async getLastExecutions(recurringId: UUID, limit: number): Promise<RecurringInvestmentExecution[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(recurringInvestmentsExecutionTable)
      .selectAll()
      .where('recurringInvestmentId', '=', recurringId)
      .orderBy('executionDate', 'desc')
      .limit(limit)
      .execute();

    if (data.length === 0) {
      return [];
    }

    return data.map(record => this.castToObject(record));
  }
}

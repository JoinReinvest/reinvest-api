import { InvestmentsDatabaseAdapterProvider, investmentsFeesTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { InvestmentsFeesTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { Fee, FeeSchema } from 'Reinvest/Investments/src/Domain/Investments/Fee';

export class FeesRepository {
  public static getClassName = (): string => 'FeesRepository';

  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  async getFeeByInvestmentId(investmentId: string): Promise<Fee | null> {
    const feeData = await this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentsFeesTable)
      .selectAll()
      .where('investmentId', '=', investmentId)
      .executeTakeFirst();

    if (!feeData) {
      return null;
    }

    return this.restoreFeeFromSchema(feeData);
  }

  async approveFee(fee: Fee) {
    const { id, status, approveDate } = fee.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(investmentsFeesTable)
        .set({
          status,
          approveDate: approveDate?.toDate(),
        })
        .where('id', '=', id)
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot update fee's status: ${error.message}`, error);

      return false;
    }
  }

  async updateStatus(fee: Fee) {
    const { id, status } = fee.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(investmentsFeesTable)
        .set({
          status,
        })
        .where('id', '=', id)
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot update status of fee: ${error.message}`, error);

      return false;
    }
  }

  private castSchemaToInvestmentsFeesTable(fee: Fee): InvestmentsFeesTable {
    const { verificationFeeIds, ...feeSchema } = fee.toObject();

    return <InvestmentsFeesTable>{
      ...feeSchema,
      amount: feeSchema.amount.getAmount(),
      approveDate: feeSchema.approveDate ? feeSchema.approveDate.toDate() : null,
      dateCreated: feeSchema.dateCreated.toDate(),
      verificationFeeIdsJson: verificationFeeIds,
    };
  }

  private restoreFeeFromSchema(feeData: InvestmentsFeesTable): Fee {
    const { verificationFeeIdsJson, ...feeSchema } = feeData;
    const schema = <FeeSchema>{
      ...feeSchema,
      amount: Money.lowPrecision(feeSchema.amount),
      approveDate: feeSchema.approveDate ? DateTime.from(feeSchema.approveDate) : null,
      dateCreated: DateTime.from(feeSchema.dateCreated),
      verificationFeeIds: verificationFeeIdsJson,
    };

    return Fee.restoreFromSchema(schema);
  }
}

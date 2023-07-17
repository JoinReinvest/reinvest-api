import { UUID } from 'HKEKTypes/Generics';
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

  async getFeeByInvestmentId(investmentId: UUID): Promise<Fee | null> {
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

  async getFeesByInvestmentId(investmentIds: UUID[]): Promise<Fee[]> {
    const fees = await this.databaseAdapterProvider.provide().selectFrom(investmentsFeesTable).selectAll().where('investmentId', 'in', investmentIds).execute();

    if (!fees) {
      return [];
    }

    return fees.map(fee => this.restoreFeeFromSchema(fee));
  }

  async storeFee(fee: Fee) {
    const values = this.castSchemaToInvestmentsFeesTable(fee);
    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(investmentsFeesTable)
        .values(values)
        .onConflict(oc =>
          oc.constraint('unique_investment_id').doUpdateSet({
            approvedByIP: eb => eb.ref(`excluded.approvedByIP`),
            status: eb => eb.ref(`excluded.status`),
            abortedDate: eb => eb.ref(`excluded.abortedDate`),
            approveDate: eb => eb.ref(`excluded.approveDate`),
          }),
        )
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot store fee for investment ${values.investmentId}`, error);

      return false;
    }
  }

  private castSchemaToInvestmentsFeesTable(fee: Fee): InvestmentsFeesTable {
    const { verificationFeeIds, ...feeSchema } = fee.toObject();

    return <InvestmentsFeesTable>{
      ...feeSchema,
      amount: feeSchema.amount.getAmount(),
      approveDate: feeSchema.approveDate ? feeSchema.approveDate.toDate() : null,
      abortedDate: feeSchema.abortedDate ? feeSchema.abortedDate.toDate() : null,
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
      abortedDate: feeSchema.abortedDate ? DateTime.from(feeSchema.abortedDate) : null,
      dateCreated: DateTime.from(feeSchema.dateCreated),
      verificationFeeIds: verificationFeeIdsJson,
    };

    return Fee.restoreFromSchema(schema);
  }
}

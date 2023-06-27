import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { VerificationDatabaseAdapterProvider, verificationFeesTable } from 'Verification/Adapter/Database/DatabaseAdapter';
import { VerificationFeesTable } from 'Verification/Adapter/Database/VerificationSchema';
import { VerificationFee, VerificationFeeSchema } from 'Verification/Domain/VerificationFee';

export class VerificationFeesRepository {
  private databaseAdapterProvider: VerificationDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: VerificationDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'VerificationFeesRepository';

  async getVerificationFeeById(id: UUID): Promise<VerificationFee | null> {
    try {
      const data = await this.databaseAdapterProvider.provide().selectFrom(verificationFeesTable).selectAll().where(`id`, '=', id).limit(1).executeTakeFirst();

      return this.mapToVerificationFee(data);
    } catch (error) {
      return null;
    }
  }

  async storeVerificationFee(verificationFee: VerificationFee): Promise<void> {
    const feeSchema = verificationFee.toObject();
    const values: VerificationFeesTable = {
      ...feeSchema,
      amount: feeSchema.amount.getAmount(),
      amountAssigned: feeSchema.amountAssigned.getAmount(),
      dateCreated: feeSchema.dateCreated.toDate(),
    };

    await this.databaseAdapterProvider
      .provide()
      .insertInto(verificationFeesTable)
      .values(values)
      .onConflict(oc => oc.column('decisionId').doNothing())
      .onConflict(oc =>
        oc.column('id').doUpdateSet({
          amountAssigned: eb => eb.ref(`excluded.amountAssigned`),
          status: eb => eb.ref(`excluded.status`),
        }),
      )
      .execute();
  }

  private mapToVerificationFee(data?: VerificationFeesTable): VerificationFee | null {
    if (!data) {
      return null;
    }

    const schema = <VerificationFeeSchema>{
      ...data,
      amount: Money.lowPrecision(data.amount),
      amountAssigned: Money.lowPrecision(data.amountAssigned),
      dateCreated: DateTime.from(data.dateCreated),
    };

    return VerificationFee.createFromSchema(schema);
  }
}

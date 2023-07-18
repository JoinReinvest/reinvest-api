import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { VerificationDatabaseAdapterProvider, verificationFeesTable } from 'Verification/Adapter/Database/DatabaseAdapter';
import { VerificationFeesTable } from 'Verification/Adapter/Database/VerificationSchema';
import { VerificationFee, VerificationFeeSchema, VerificationFeeStatus } from 'Verification/Domain/VerificationFee';

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

  async updateVerificationFees(verificationFees: VerificationFee[]): Promise<void> {
    if (verificationFees.length === 0) {
      return;
    }

    const values = verificationFees.map(verificationFee => this.mapVerificationSchemaToTable(verificationFee));

    await this.databaseAdapterProvider
      .provide()
      .insertInto(verificationFeesTable)
      .values(values)
      .onConflict(oc =>
        oc.column('decisionId').doUpdateSet({
          amountAssigned: eb => eb.ref(`excluded.amountAssigned`),
          status: eb => eb.ref(`excluded.status`),
        }),
      )
      .execute();
  }

  async createVerificationFee(verificationFee: VerificationFee): Promise<void> {
    const values = this.mapVerificationSchemaToTable(verificationFee);
    await this.databaseAdapterProvider
      .provide()
      .insertInto(verificationFeesTable)
      .values(values)
      .onConflict(oc => oc.column('decisionId').doNothing())
      .execute();
  }

  private mapVerificationSchemaToTable(verificationFee: VerificationFee): VerificationFeesTable {
    const feeSchema = verificationFee.toObject();
    const values: VerificationFeesTable = {
      ...feeSchema,
      amount: feeSchema.amount.getAmount(),
      amountAssigned: feeSchema.amountAssigned.getAmount(),
      dateCreated: feeSchema.dateCreated.toDate(),
    };

    return values;
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

  async getNotAssignedFees(profileId: UUID, accountId: UUID): Promise<VerificationFee[]> {
    try {
      const data = await this.databaseAdapterProvider
        .provide()
        .selectFrom(verificationFeesTable)
        .selectAll()
        .where(`status`, 'in', [VerificationFeeStatus.NOT_ASSIGNED, VerificationFeeStatus.PARTIALLY_ASSIGNED])
        .where(eb => eb.where(`profileId`, '=', profileId).orWhere(`accountId`, '=', accountId))
        .orderBy('status', 'desc') // partially assigned first
        .execute();

      if (!data) {
        return [];
      }

      return data.map(record => <VerificationFee>this.mapToVerificationFee(record));
    } catch (error: any) {
      console.error(`Error while fetching verification fees for account ${profileId}/${accountId}`, error);

      return [];
    }
  }

  async getFeesByIds(feesId: UUID[]): Promise<VerificationFee[]> {
    const data = await this.databaseAdapterProvider.provide().selectFrom(verificationFeesTable).selectAll().where(`id`, 'in', feesId).execute();

    if (!data) {
      return [];
    }

    return data.map(record => <VerificationFee>this.mapToVerificationFee(record));
  }
}

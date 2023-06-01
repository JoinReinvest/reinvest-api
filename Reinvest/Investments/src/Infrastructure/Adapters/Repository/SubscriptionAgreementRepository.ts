import { JSONObject } from 'HKEKTypes/Generics';
import type { SubscriptionAgreementCreate } from 'Investments/Application/UseCases/CreateSubscriptionAgreement';
import { InvestmentsDatabaseAdapterProvider, subscriptionAgreementTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { SubscriptionAgreement } from 'Reinvest/Investments/src/Domain/Investments/SubscriptionAgreement';

export class SubscriptionAgreementRepository {
  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'SubscriptionAgreementRepository';

  async create(subscription: SubscriptionAgreementCreate): Promise<boolean> {
    const { id, accountId, profileId, investmentId, status, contentFieldsJson, templateVersion, agreementType } = subscription;
    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(subscriptionAgreementTable)
        .values({
          id,
          profileId,
          investmentId,
          status,
          accountId,
          dateCreated: new Date(),
          agreementType,
          signedAt: null,
          signedByIP: null,
          pdfDateCreated: null,
          templateVersion,
          contentFieldsJson: <JSONObject>{ ...contentFieldsJson },
        })
        .onConflict(oc =>
          oc.constraint('investment_id_unique').doUpdateSet({
            id,
            status,
            dateCreated: new Date(),
            signedAt: null,
            signedByIP: null,
            pdfDateCreated: null,
            templateVersion,
            contentFieldsJson: <JSONObject>{ ...contentFieldsJson },
          }),
        )
        .executeTakeFirst();

      return true;
    } catch (error: any) {
      console.error(`Cannot create subscription agreement: ${error.message}`, error);

      return false;
    }
  }

  async getSubscriptionAgreement(profileId: string, subscriptionAgreementId: string) {
    const subscriptionAgreement = await this.databaseAdapterProvider
      .provide()
      .selectFrom(subscriptionAgreementTable)
      .select([
        'id',
        'profileId',
        'investmentId',
        'status',
        'accountId',
        'dateCreated',
        'agreementType',
        'signedAt',
        'signedByIP',
        'pdfDateCreated',
        'templateVersion',
        'contentFieldsJson',
      ])
      .where('id', '=', subscriptionAgreementId)
      .where('profileId', '=', profileId)
      .executeTakeFirst();

    if (!subscriptionAgreement) return null;

    return SubscriptionAgreement.create(subscriptionAgreement);
  }

  async getSubscriptionAgreementByInvestmentId(profileId: string, investmentId: string) {
    const subscriptionAgreement = await this.databaseAdapterProvider
      .provide()
      .selectFrom(subscriptionAgreementTable)
      .select([
        'id',
        'profileId',
        'investmentId',
        'status',
        'accountId',
        'dateCreated',
        'agreementType',
        'signedAt',
        'signedByIP',
        'pdfDateCreated',
        'templateVersion',
        'contentFieldsJson',
      ])
      .where('investmentId', '=', investmentId)
      .where('profileId', '=', profileId)
      .executeTakeFirst();

    if (!subscriptionAgreement) return null;

    return SubscriptionAgreement.create(subscriptionAgreement);
  }

  async signSubscriptionAgreement(subscriptionAgreement: SubscriptionAgreement) {
    const { id, status, signedByIP, signedAt } = subscriptionAgreement.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(subscriptionAgreementTable)
        .set({
          id,
          status,
          signedByIP,
          signedAt,
        })
        .where('id', '=', id)
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot sign subscription agreement: ${error.message}`, error);

      return false;
    }
  }

  async delete(accountId: string, subscriptionAgreementId: string) {
    try {
      await this.databaseAdapterProvider
        .provide()
        .deleteFrom(subscriptionAgreementTable)
        .where('id', '=', subscriptionAgreementId)
        .where('accountId', '=', accountId)
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot delete subscription agreement: ${error.message}`, error);

      return false;
    }
  }
}

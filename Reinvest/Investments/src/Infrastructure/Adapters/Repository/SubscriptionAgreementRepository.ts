import { JSONObject } from 'HKEKTypes/Generics';
import { InvestmentsDatabaseAdapterProvider, subscriptionAgreementTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import type { SubscriptionAgreementCreate } from 'Investments/Infrastructure/UseCases/CreateSubscriptionAgreement';

import { SubscriptionAgreement } from '../../ValueObject/SubscriptionAgreement';

export class SubscriptionAgreementRepository {
  public static getClassName = (): string => 'SubscriptionAgreementRepository';

  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

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
        .execute();

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
}

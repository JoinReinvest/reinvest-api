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

  async create(subscription: SubscriptionAgreementCreate) {
    const { id, accountId, profileId, investmentId, status, agreementType } = subscription;
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
          templateVersion: 1,
          contentFieldsJson: <JSONObject>{ value: 'value' },
        })
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create subscription agreement: ${error.message}`, error);

      return false;
    }
  }

  async getSubscriptionAgreement(profileId: string, accountId: string, investmentId: string) {
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
      .where('accountId', '=', accountId)
      .where('profileId', '=', profileId)
      .where('investmentId', '=', investmentId)
      .executeTakeFirst();

    if (!subscriptionAgreement) return false;

    return SubscriptionAgreement.create(subscriptionAgreement);
  }
}

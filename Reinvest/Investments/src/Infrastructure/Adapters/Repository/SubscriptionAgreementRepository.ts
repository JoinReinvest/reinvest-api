import { InvestmentsDatabaseAdapterProvider, subscriptionAgreementTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { SubscriptionAgreementTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';
import { DateTime } from 'Money/DateTime';
import { SubscriptionAgreement } from 'Reinvest/Investments/src/Domain/Investments/SubscriptionAgreement';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { TemplateContentType } from 'Templates/Types';
import { AgreementTypes } from 'Investments/Domain/Investments/Types';

export class SubscriptionAgreementRepository {
  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;
  private eventsPublisher: EventBus;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider, eventsPublisher: EventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.eventsPublisher = eventsPublisher;
  }

  public static getClassName = (): string => 'SubscriptionAgreementRepository';

  async getSubscriptionAgreement(profileId: string, subscriptionAgreementId: string) {
    const subscriptionAgreement = await this.databaseAdapterProvider
      .provide()
      .selectFrom(subscriptionAgreementTable)
      .selectAll()
      .where('id', '=', subscriptionAgreementId)
      .where('profileId', '=', profileId)
      .executeTakeFirst();

    if (!subscriptionAgreement) {
      return null;
    }

    return this.castToObject(subscriptionAgreement);
  }

  async getSubscriptionAgreementByInvestmentId(profileId: string, investmentId: string, agreementType: AgreementTypes) {
    const subscriptionAgreement = await this.databaseAdapterProvider
      .provide()
      .selectFrom(subscriptionAgreementTable)
      .selectAll()
      .where('investmentId', '=', investmentId)
      .where('profileId', '=', profileId)
      .where('agreementType', '=', agreementType)
      .executeTakeFirst();

    if (!subscriptionAgreement) return null;

    return this.castToObject(subscriptionAgreement);
  }

  async deleteByInvestmentId(accountId: string, investmentId: string) {
    await this.databaseAdapterProvider
      .provide()
      .deleteFrom(subscriptionAgreementTable)
      .where('investmentId', '=', investmentId)
      .where('accountId', '=', accountId)
      .execute();

    return true;
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

  async publishEvents(events: DomainEvent[] = []): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.eventsPublisher.publishMany(events);
  }

  async createOrUpdate(subscriptionAgreement: SubscriptionAgreement): Promise<boolean> {
    try {
      const data = this.castToTable(subscriptionAgreement);
      await this.databaseAdapterProvider
        .provide()
        .insertInto(subscriptionAgreementTable)
        .values(data)
        .onConflict(oc =>
          oc.constraint('investment_id_unique').doUpdateSet({
            contentFieldsJson: eb => eb.ref(`excluded.contentFieldsJson`),
            templateVersion: eb => eb.ref(`excluded.templateVersion`),
            dateCreated: eb => eb.ref(`excluded.dateCreated`),
            id: eb => eb.ref(`excluded.id`),
            pdfDateCreated: eb => eb.ref(`excluded.pdfDateCreated`),
            signedAt: eb => eb.ref(`excluded.signedAt`),
            signedByIP: eb => eb.ref(`excluded.signedByIP`),
            status: eb => eb.ref(`excluded.status`),
          }),
        )
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot store investment ${subscriptionAgreement.getId()}`, error);

      return false;
    }
  }

  async store(subscriptionAgreement: SubscriptionAgreement, events: DomainEvent[] = []): Promise<boolean> {
    try {
      const data = this.castToTable(subscriptionAgreement);
      await this.databaseAdapterProvider
        .provide()
        .insertInto(subscriptionAgreementTable)
        .values(data)
        .onConflict(oc =>
          oc.constraint('investment_id_unique').doUpdateSet({
            pdfDateCreated: eb => eb.ref(`excluded.pdfDateCreated`),
            signedAt: eb => eb.ref(`excluded.signedAt`),
            signedByIP: eb => eb.ref(`excluded.signedByIP`),
            status: eb => eb.ref(`excluded.status`),
          }),
        )
        .execute();

      if (events.length > 0) {
        await this.publishEvents(events);
      }

      return true;
    } catch (error: any) {
      console.error(`Cannot store investment ${subscriptionAgreement.getId()}`, error);

      return false;
    }
  }

  private castToObject(data: SubscriptionAgreementTable): SubscriptionAgreement {
    return SubscriptionAgreement.restore({
      ...data,
      contentFieldsJson: <TemplateContentType>data.contentFieldsJson,
      dateCreated: DateTime.from(data.dateCreated),
      signedAt: data.signedAt ? DateTime.from(data.signedAt) : null,
      pdfDateCreated: data.pdfDateCreated ? DateTime.from(data.pdfDateCreated) : null,
    });
  }

  private castToTable(object: SubscriptionAgreement): SubscriptionAgreementTable {
    const schema = object.toObject();

    return {
      ...schema,
      dateCreated: schema.dateCreated.toDate(),
      signedAt: schema.signedAt?.toDate() || null,
      pdfDateCreated: schema.pdfDateCreated?.toDate() || null,
    };
  }
}

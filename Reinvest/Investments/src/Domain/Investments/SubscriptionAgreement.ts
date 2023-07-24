import { UUID } from 'HKEKTypes/Generics';
import { AgreementTypes, SubscriptionAgreementStatus } from 'Investments/Domain/Investments/Types';
import { DateTime } from 'Money/DateTime';
import { DomainEvent } from 'SimpleAggregator/Types';
import { Template } from 'Templates/Template';
import { LatestTemplateContentFields } from 'Templates/TemplateConfiguration';
import { TemplateContentType, Templates, TemplateVersion } from 'Templates/Types';

export enum SubscriptionAgreementEvents {
  SubscriptionAgreementSigned = 'SubscriptionAgreementSigned',
  RecurringSubscriptionAgreementSigned = 'RecurringSubscriptionAgreementSigned',
  GenerateSubscriptionAgreementCommand = 'GenerateSubscriptionAgreementCommand',
}

export type SubscriptionAgreementId = UUID;

export type SubscriptionAgreementEvent = DomainEvent & {
  data: {
    profileId: UUID;
  };
  id: SubscriptionAgreementId;
  kind: SubscriptionAgreementEvents;
};

type SubscriptionAgreementSchema = {
  accountId: UUID;
  agreementType: AgreementTypes;
  contentFieldsJson: TemplateContentType;
  dateCreated: DateTime;
  id: UUID;
  investmentId: UUID;
  pdfDateCreated: DateTime | null;
  profileId: UUID;
  signedAt: DateTime | null;
  signedByIP: string | null;
  status: SubscriptionAgreementStatus;
  templateVersion: TemplateVersion;
};

export class SubscriptionAgreement {
  private readonly subscriptionAgreementSchema: SubscriptionAgreementSchema;

  constructor(subscriptionAgreementSchema: SubscriptionAgreementSchema) {
    this.subscriptionAgreementSchema = subscriptionAgreementSchema;
  }

  getId(): UUID {
    return this.subscriptionAgreementSchema.id;
  }

  sign(ip: string): void {
    const signedAt = DateTime.now();
    this.subscriptionAgreementSchema.status = SubscriptionAgreementStatus.SIGNED;
    this.subscriptionAgreementSchema.signedByIP = ip;
    this.subscriptionAgreementSchema.signedAt = signedAt;
    this.subscriptionAgreementSchema.contentFieldsJson.ipAddress = ip;
    this.subscriptionAgreementSchema.contentFieldsJson.signingTimestamp = signedAt.toTimestamp().toString();
    this.subscriptionAgreementSchema.contentFieldsJson.signingDate = signedAt.toFormattedDate('MM/DD/YYYY');
  }

  isSigned() {
    return this.subscriptionAgreementSchema.status === SubscriptionAgreementStatus.SIGNED;
  }

  forParser(): {
    content: TemplateContentType;
    template: Templates;
    version: TemplateVersion;
  } {
    return {
      version: this.subscriptionAgreementSchema.templateVersion,
      content: this.subscriptionAgreementSchema.contentFieldsJson,
      template:
        this.subscriptionAgreementSchema.agreementType === AgreementTypes.DIRECT_DEPOSIT
          ? Templates.SUBSCRIPTION_AGREEMENT
          : Templates.RECURRING_SUBSCRIPTION_AGREEMENT,
    };
  }

  toObject(): SubscriptionAgreementSchema {
    return this.subscriptionAgreementSchema;
  }

  markAsGenerated(): void {
    this.subscriptionAgreementSchema.pdfDateCreated = DateTime.now();
  }

  static createForInvestment(
    id: UUID,
    profileId: UUID,
    accountId: UUID,
    investmentId: UUID,
    dateCreated: DateTime,
    contentFields: LatestTemplateContentFields[Templates.SUBSCRIPTION_AGREEMENT],
  ): SubscriptionAgreement {
    const templateVersion = Template.getLatestTemplateVersion(Templates.SUBSCRIPTION_AGREEMENT);

    return new SubscriptionAgreement({
      id,
      profileId,
      accountId,
      investmentId,
      status: SubscriptionAgreementStatus.WAITING_FOR_SIGNATURE,
      agreementType: AgreementTypes.DIRECT_DEPOSIT,
      contentFieldsJson: contentFields,
      templateVersion,
      dateCreated,
      signedAt: null,
      signedByIP: null,
      pdfDateCreated: null,
    });
  }

  static createForRecurringInvestment(
    id: UUID,
    profileId: UUID,
    accountId: UUID,
    recurringInvestmentId: UUID,
    dateCreated: DateTime,
    contentFields: LatestTemplateContentFields[Templates.RECURRING_SUBSCRIPTION_AGREEMENT],
  ): SubscriptionAgreement {
    const templateVersion = Template.getLatestTemplateVersion(Templates.RECURRING_SUBSCRIPTION_AGREEMENT);

    return new SubscriptionAgreement({
      id,
      profileId,
      accountId,
      investmentId: recurringInvestmentId,
      status: SubscriptionAgreementStatus.WAITING_FOR_SIGNATURE,
      agreementType: AgreementTypes.RECURRING_INVESTMENT,
      contentFieldsJson: contentFields,
      templateVersion,
      dateCreated,
      signedAt: null,
      signedByIP: null,
      pdfDateCreated: null,
    });
  }

  static restore(schema: SubscriptionAgreementSchema): SubscriptionAgreement {
    return new SubscriptionAgreement(schema);
  }
}

import { UUID } from 'HKEKTypes/Generics';
import { AgreementTypes, SubscriptionAgreementStatus } from 'Investments/Domain/Investments/Types';
import { DateTime } from 'Money/DateTime';
import { DomainEvent } from 'SimpleAggregator/Types';
import { Template } from 'Templates/Template';
import { TemplateContentType, Templates, TemplateVersion } from 'Templates/Types';
import { LatestTemplateContentFields } from 'Templates/TemplateConfiguration';

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

  getId() {
    return this.subscriptionAgreementSchema.id;
  }

  sign(ip: string) {
    this.subscriptionAgreementSchema.status = SubscriptionAgreementStatus.SIGNED;
    this.subscriptionAgreementSchema.signedByIP = ip;
    this.subscriptionAgreementSchema.signedAt = DateTime.now();
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
      dateCreated: DateTime.now(),
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
    mockedContentFieldsJson: LatestTemplateContentFields[Templates.RECURRING_SUBSCRIPTION_AGREEMENT],
  ): SubscriptionAgreement {
    const templateVersion = Template.getLatestTemplateVersion(Templates.RECURRING_SUBSCRIPTION_AGREEMENT);

    return new SubscriptionAgreement({
      id,
      profileId,
      accountId,
      investmentId: recurringInvestmentId,
      status: SubscriptionAgreementStatus.WAITING_FOR_SIGNATURE,
      agreementType: AgreementTypes.RECURRING_INVESTMENT,
      contentFieldsJson: mockedContentFieldsJson,
      templateVersion,
      dateCreated: DateTime.now(),
      signedAt: null,
      signedByIP: null,
      pdfDateCreated: null,
    });
  }

  static restore(schema: SubscriptionAgreementSchema): SubscriptionAgreement {
    return new SubscriptionAgreement(schema);
  }
}

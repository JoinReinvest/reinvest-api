import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { DomainEvent } from 'SimpleAggregator/Types';
import { Template } from 'Templates/Template';
import { LatestTemplateContentFields } from 'Templates/TemplateConfiguration';
import { TemplateContentType, Templates, TemplateVersion } from 'Templates/Types';

export enum WithdrawalsDocumentsEvents {
  WithdrawalsDocumentCreated = 'WithdrawalsDocumentCreated',
}

export enum WithdrawalsDocumentsTypes {
  REDEMPTION = 'REDEMPTION',
  PAYOUT = 'PAYOUT',
}

export type WithdrawalsDocumentsEvent = DomainEvent & {
  data: {
    type: WithdrawalsDocumentsTypes;
  };
  id: UUID;
  kind: WithdrawalsDocumentsEvents;
};

export enum WithdrawalsDocumentsStatus {
  CREATED = 'CREATED',
  COMPLETED = 'COMPLETED',
}

type WithdrawalDocumentsSchema = {
  contentFieldsJson: TemplateContentType;
  dateCreated: DateTime;
  id: UUID;
  pdfDateCreated: DateTime | null;
  status: WithdrawalsDocumentsStatus;
  templateName: Templates;
  templateVersion: TemplateVersion;
  type: WithdrawalsDocumentsTypes;
  withdrawalId: UUID;
};

export class WithdrawalsDocuments {
  private readonly withdrawalDocumentsSchema: WithdrawalDocumentsSchema;

  constructor(withdrawalDocumentsSchema: WithdrawalDocumentsSchema) {
    this.withdrawalDocumentsSchema = withdrawalDocumentsSchema;
  }

  getId(): UUID {
    return this.withdrawalDocumentsSchema.id;
  }

  toObject(): WithdrawalDocumentsSchema {
    return this.withdrawalDocumentsSchema;
  }

  markAsGenerated(): void {
    this.withdrawalDocumentsSchema.pdfDateCreated = DateTime.now();
  }

  forParser(): {
    content: TemplateContentType;
    template: Templates;
    version: TemplateVersion;
  } {
    return {
      version: this.withdrawalDocumentsSchema.templateVersion,
      content: this.withdrawalDocumentsSchema.contentFieldsJson,
      template: this.withdrawalDocumentsSchema.templateName,
    };
  }

  static restore(schema: WithdrawalDocumentsSchema) {
    return new WithdrawalsDocuments(schema);
  }

  static createPayout(id: UUID, withdrawalId: UUID, contentFields: LatestTemplateContentFields[Templates.PAYOUT]): WithdrawalsDocuments {
    const templateName = Templates.PAYOUT;
    const templateVersion = Template.getLatestTemplateVersion(templateName);

    return new WithdrawalsDocuments({
      id,
      withdrawalId,
      contentFieldsJson: contentFields,
      dateCreated: DateTime.now(),
      pdfDateCreated: null,
      status: WithdrawalsDocumentsStatus.CREATED,
      templateName,
      templateVersion,
      type: WithdrawalsDocumentsTypes.PAYOUT,
    });
  }

  static createRedemptions(id: UUID, withdrawalId: UUID, contentFields: LatestTemplateContentFields[Templates.REDEMPTION_FORM]): WithdrawalsDocuments {
    const templateName = Templates.REDEMPTION_FORM;
    const templateVersion = Template.getLatestTemplateVersion(templateName);

    return new WithdrawalsDocuments({
      id,
      withdrawalId,
      contentFieldsJson: contentFields,
      dateCreated: DateTime.now(),
      pdfDateCreated: null,
      status: WithdrawalsDocumentsStatus.CREATED,
      templateName,
      templateVersion,
      type: WithdrawalsDocumentsTypes.REDEMPTION,
    });
  }

  isGenerated(): boolean {
    return !!this.withdrawalDocumentsSchema.pdfDateCreated;
  }

  getWithdrawalId(): UUID {
    return this.withdrawalDocumentsSchema.withdrawalId;
  }
}

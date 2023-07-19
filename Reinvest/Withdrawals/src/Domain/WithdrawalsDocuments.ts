import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { DomainEvent } from 'SimpleAggregator/Types';
import { Template } from 'Templates/Template';
import { TemplateContentType, Templates, TemplateVersion } from 'Templates/Types';

export enum WithdrawalsDocumentsEvents {
  WithdrawalsDocumentCreated = 'WithdrawalsDocumentCreated',
}

export type WithdrawalsDocumentsEvent = DomainEvent & {
  data: {
    type: WithdrawalsDocumentsTypes;
  };
  id: UUID;
  kind: WithdrawalsDocumentsEvents;
};

export enum WithdrawalsDocumentsStatuses {
  CREATED = 'CREATED',
  REDEEMED = 'REDEEMED',
}

export enum WithdrawalsDocumentsTypes {
  REDEMPTION = 'REDEMPTION',
  PAYOUT = 'PAYOUT',
}

type WithdrawalDocumentsSchema = {
  contentFieldsJson: TemplateContentType;
  dateCompleted: DateTime | null;
  dateCreated: DateTime;
  id: UUID;
  pdfDateCreated: DateTime | null;
  status: WithdrawalsDocumentsStatuses;
  templateVersion: TemplateVersion;
  type: WithdrawalsDocumentsTypes;
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
      template: this.withdrawalDocumentsSchema.type === WithdrawalsDocumentsTypes.REDEMPTION ? Templates.REDEMPTION_FORM : Templates.REDEMPTION_FORM,
    };
  }

  static create(schema: Omit<WithdrawalDocumentsSchema, 'templateVersion'>): WithdrawalsDocuments {
    const templateVersion = Template.getLatestTemplateVersion(Templates.REDEMPTION_FORM);

    return new WithdrawalsDocuments({ ...schema, templateVersion });
  }
}

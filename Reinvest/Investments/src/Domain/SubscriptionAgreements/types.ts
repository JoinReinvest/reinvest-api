export type Template = {
  paragraphs: {
    lines: string[];
    isCheckedOption?: boolean;
  }[];
  header?: string;
}[];

export type DynamicType = { [key: string]: string };

export type SubscriptionAgreementTemplateVersions = 1;

export type RecurringSubscriptionAgreementTemplateVersions = 1;

export enum PdfTypes {
  AGREEMENT = 'AGREEMENT',
}

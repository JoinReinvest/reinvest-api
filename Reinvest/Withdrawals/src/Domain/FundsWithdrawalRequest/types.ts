export type Template = {
  paragraphs: {
    lines: string[];
    isCheckedOption?: boolean;
  }[];
  header?: string;
}[];

export type DynamicType = { [key: string]: string };

export type FundsWithdrawalAgreementTemplateVersions = 1;

export enum PdfTypes {
  AGREEMENT = 'AGREEMENT',
}

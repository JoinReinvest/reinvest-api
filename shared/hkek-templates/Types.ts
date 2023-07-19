export type TemplateStructureType<T = any> = {
  paragraphs: {
    lines: (string | ((content: TemplateContentType) => string | null))[];
    isCheckedOption?: boolean | ((content: TemplateContentType) => boolean);
  }[];
  header?: string;
  tableContent?: T | ((content: TemplateContentType) => T);
}[];

export type TemplateContentType = Record<string, string | boolean | undefined | number | object>;
export type TemplateVersion = number;
export type HtmlTemplate = string;

export enum Templates {
  SUBSCRIPTION_AGREEMENT = 'SUBSCRIPTION_AGREEMENT',
  RECURRING_SUBSCRIPTION_AGREEMENT = 'RECURRING_SUBSCRIPTION_AGREEMENT',
  REDEMPTION_FORM = 'REDEMPTION_FORM',
  PAYOUT = 'PAYOUT',
}

export type TemplateMappingType = {
  [version in TemplateVersion]: {
    html: HtmlTemplate;
    template: TemplateStructureType;
  };
};

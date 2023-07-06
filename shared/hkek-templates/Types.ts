export type TemplateStructureType = {
  paragraphs: {
    lines: string[];
    isCheckedOption?: boolean;
  }[];
  header?: string;
}[];

export type TemplateContentType = { [key: string]: string };
export type TemplateVersion = number;
export type HtmlTemplate = string;

export enum Templates {
  SUBSCRIPTION_AGREEMENT = 'SUBSCRIPTION_AGREEMENT',
  RECURRING_SUBSCRIPTION_AGREEMENT = 'RECURRING_SUBSCRIPTION_AGREEMENT',
}

export type TemplateMappingType = {
  [version in TemplateVersion]: {
    html: HtmlTemplate;
    template: TemplateStructureType;
  };
};

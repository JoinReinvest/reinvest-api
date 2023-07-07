export type TemplateStructureType = {
  paragraphs: {
    lines: (string | ((content: TemplateContentType) => string | null))[];
    isCheckedOption?: boolean | ((content: TemplateContentType) => boolean);
  }[];
  header?: string;
}[];

export type TemplateContentType = Record<string, string | boolean | undefined | number>;
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

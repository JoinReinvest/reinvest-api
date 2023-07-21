export type TemplateStructureType<T = any> = {
  paragraphs: {
    lines: (string | ((content: TemplateContentType) => string | null))[];
    isCheckedOption?: boolean | ((content: TemplateContentType) => boolean);
  }[];
  header?: string;
  tableContent?: (content: TemplateContentType) => {
    data: string[];
    header?: string[];
  };
}[];

export type ParsedStructureType = {
  paragraphs: {
    lines: string[];
    isCheckedOption?: boolean;
  }[];
  header?: string;
  tableContent?: {
    data: string[];
    header?: string[];
  };
}[];

export type TemplateContentType = Record<string, string | boolean | undefined | number | object>;
export type TemplateVersion = number;
export type HtmlTemplate = string;

export enum Templates {
  SUBSCRIPTION_AGREEMENT = 'SUBSCRIPTION_AGREEMENT',
  RECURRING_SUBSCRIPTION_AGREEMENT = 'RECURRING_SUBSCRIPTION_AGREEMENT',
  REDEMPTION_FORM = 'REDEMPTION_FORM',
  PAYOUT = 'PAYOUT',
  WITHDRAWAL_AGREEMENT = 'WITHDRAWAL_AGREEMENT',
}

export type TemplateMappingType = {
  [version in TemplateVersion]: {
    html: HtmlTemplate;
    template: TemplateStructureType;
  };
};

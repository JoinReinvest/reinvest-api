import { GeneralAgreementHTMLTemplate } from 'Templates/Templates/HtmlGeneralTemplates/GeneralAgreementTemplate';
import { RecurringSubscriptionAgreementContentFieldsV1, recurringSubscriptionAgreementTemplateV1 } from 'Templates/Templates/RecurringSubscriptionAgreement/v1';
import { SubscriptionAgreementContentFieldsV1, subscriptionAgreementTemplateV1 } from 'Templates/Templates/SubscriptionAgreement/v1';
import { TemplateMappingType, Templates, TemplateVersion } from 'Templates/Types';

export const TemplateCurrentVersions: Record<Templates, TemplateVersion> = {
  [Templates.SUBSCRIPTION_AGREEMENT]: 1,
  [Templates.RECURRING_SUBSCRIPTION_AGREEMENT]: 1,
};

export type LatestTemplateContentFields = {
  [Templates.SUBSCRIPTION_AGREEMENT]: SubscriptionAgreementContentFieldsV1;
  [Templates.RECURRING_SUBSCRIPTION_AGREEMENT]: RecurringSubscriptionAgreementContentFieldsV1;
};

export const TemplateMapping: Record<Templates, TemplateMappingType> = {
  [Templates.SUBSCRIPTION_AGREEMENT]: {
    1: {
      template: subscriptionAgreementTemplateV1,
      html: GeneralAgreementHTMLTemplate,
    },
  },
  [Templates.RECURRING_SUBSCRIPTION_AGREEMENT]: {
    1: {
      template: recurringSubscriptionAgreementTemplateV1,
      html: GeneralAgreementHTMLTemplate,
    },
  },
};

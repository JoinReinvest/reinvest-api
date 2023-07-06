import { GeneralAgreementHTMLTemplate } from 'Templates/Templates/HtmlGeneralTemplates/GeneralAgreementTemplate';
import { recurringSubscriptionAgreementTemplateV1 } from 'Templates/Templates/RecurringSubscriptionAgreement/v1';
import { subscriptionAgreementTemplateV1 } from 'Templates/Templates/SubscriptionAgreement/v1';
import { TemplateMappingType, Templates, TemplateVersion } from 'Templates/Types';

export const TemplateCurrentVersions: Record<Templates, TemplateVersion> = {
  [Templates.SUBSCRIPTION_AGREEMENT]: 1,
  [Templates.RECURRING_SUBSCRIPTION_AGREEMENT]: 1,
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

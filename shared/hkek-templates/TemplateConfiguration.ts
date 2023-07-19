import {
  FundsWithdrawalRequestAgreementContentFieldsV1,
  fundsWithdrawalRequestAgreementTemplateV1,
} from 'Templates/Templates/FundsWithdrawalRequestAgreement/v1';
import { GeneralAgreementHTMLTemplate } from 'Templates/Templates/HtmlGeneralTemplates/GeneralAgreementTemplate';
import { PayoutHTMLTemplate } from 'Templates/Templates/HtmlGeneralTemplates/PayoutTemplate';
import { RedemptionFormHTMLTemplate } from 'Templates/Templates/HtmlGeneralTemplates/RedemptionFormTemplate';
import { PayoutContentFieldsV1, payoutTemplateV1 } from 'Templates/Templates/Payout/v1';
import { RecurringSubscriptionAgreementContentFieldsV1, recurringSubscriptionAgreementTemplateV1 } from 'Templates/Templates/RecurringSubscriptionAgreement/v1';
import { RedemptionFormContentFieldsV1, redemptionFormTemplateV1 } from 'Templates/Templates/RedemptionForm/v1';
import { SubscriptionAgreementContentFieldsV1, subscriptionAgreementTemplateV1 } from 'Templates/Templates/SubscriptionAgreement/v1';
import { TemplateMappingType, Templates, TemplateVersion } from 'Templates/Types';

export const TemplateCurrentVersions: Record<Templates, TemplateVersion> = {
  [Templates.SUBSCRIPTION_AGREEMENT]: 1,
  [Templates.RECURRING_SUBSCRIPTION_AGREEMENT]: 1,
  [Templates.REDEMPTION_FORM]: 1,
  [Templates.PAYOUT]: 1,
  [Templates.WITHDRAWAL_AGREEMENT]: 1,
};

export type LatestTemplateContentFields = {
  [Templates.SUBSCRIPTION_AGREEMENT]: SubscriptionAgreementContentFieldsV1;
  [Templates.RECURRING_SUBSCRIPTION_AGREEMENT]: RecurringSubscriptionAgreementContentFieldsV1;
  [Templates.REDEMPTION_FORM]: RedemptionFormContentFieldsV1;
  [Templates.PAYOUT]: PayoutContentFieldsV1;
  [Templates.WITHDRAWAL_AGREEMENT]: FundsWithdrawalRequestAgreementContentFieldsV1;
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
  [Templates.REDEMPTION_FORM]: {
    1: {
      template: redemptionFormTemplateV1,
      html: RedemptionFormHTMLTemplate,
    },
  },
  [Templates.PAYOUT]: {
    1: {
      template: payoutTemplateV1,
      html: PayoutHTMLTemplate,
    },
  },
  [Templates.WITHDRAWAL_AGREEMENT]: {
    1: {
      template: fundsWithdrawalRequestAgreementTemplateV1,
      html: GeneralAgreementHTMLTemplate,
    },
  },
};

import { NotificationTemplate } from './emailTemplates/notification';
import { ShareCalculationTemplate } from './emailTemplates/shareCalculationTemplate';

export const SesResources = {
  NotificationTemplate: {
    Type: 'AWS::SES::Template',
    Properties: {
      Template: {
        TemplateName: 'NotificationTemplate',
        SubjectPart: '{{subject}}',
        HtmlPart: NotificationTemplate,
      },
    },
  },
  ShareCalculationTemplate: {
    Type: 'AWS::SES::Template',
    Properties: {
      Template: {
        TemplateName: 'ShareCalculationTemplate',
        SubjectPart: '{{subject}}',
        HtmlPart: ShareCalculationTemplate,
      },
    },
  },
};

export const SESSendPolicy = [
  {
    Effect: 'Allow',
    Action: ['ses:*'],
    Resource: '*',
  },
];

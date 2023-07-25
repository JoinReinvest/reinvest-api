import { NotificationTemplate } from './emailTemplates/notification';

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
};

export const SESSendPolicy = [
  {
    Effect: 'Allow',
    Action: ['ses:*'],
    Resource: '*',
  },
];

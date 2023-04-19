import { WelcomeTemplate } from './emailTemplates/welcome';

export const SesResources = {
  WelcomeTemplate: {
    Type: 'AWS::SES::Template',
    Properties: {
      Template: {
        TemplateName: 'WelcomeTemplate',
        SubjectPart: 'Welcome in the REINVEST Community',
        HtmlPart: WelcomeTemplate,
      },
    },
  },
};

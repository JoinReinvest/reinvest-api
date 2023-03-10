import {WelcomeTemplate} from "./emailTemplates/welcome";

export const SesResources = {
    EmailIdentity: {
        Type: "AWS::SES::EmailIdentity",
        Properties: {
            EmailIdentity: "${env:EMAIL_SEND_FROM}",
        },
    },
    WelcomeTemplate: {
        Type: "AWS::SES::Template",
        Properties: {
            Template: {
                TemplateName: "WelcomeTemplate",
                SubjectPart: "Welcome in the REINVEST Community",
                HtmlPart: WelcomeTemplate
            }
        },
    },
}
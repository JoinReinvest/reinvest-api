import {WelcomeTemplate} from "./emailTemplates/welcome";
import {exportOutput, getAttribute, importOutput} from "./utils";

export const SesResources = {
    SendFromEmail: {
        Type: "AWS::SES::EmailIdentity",
        Properties: {
            EmailIdentity: "${env:EMAIL_SEND_FROM}",
        },
    },
    NoReplyEmail: {
        Type: "AWS::SES::EmailIdentity",
        Properties: {
            EmailIdentity: "${env:EMAIL_NO_REPLY}",
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

export const SesOutputs = {
    SendFromEmailArn: {
        Value: getAttribute("SendFromEmail", "Arn"),
        Description: "The verified send from email address ARN (resource name)",
        ...exportOutput('SendFromEmailArn')
    },
    SendFromEmail: {
        Value: "${env:EMAIL_SEND_FROM}",
        Description: "The verified send from email address",
        ...exportOutput('SendFromEmail')
    },
    NoReplyEmail: {
        Value: "${env:EMAIL_NO_REPLY}",
        Description: "The verified no reply email address",
        ...exportOutput('NoReplyEmail')
    }
}

export const SesInputs = {
    SendFromEmailArn: importOutput('SendFromEmailArn', true),
    SendFromEmail: importOutput('SendFromEmail', true),
    NoReplyEmail: importOutput('NoReplyEmail', true),
}
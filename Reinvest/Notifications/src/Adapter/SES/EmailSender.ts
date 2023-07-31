import { SendTemplatedEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { DictionaryType } from 'HKEKTypes/Generics';

export type EmailConfiguration = {
  region: string;
  replyToEmail: string;
  sourceEmail: string;
};

export enum EmailTemplate {
  NOTIFICATION = 'NotificationTemplate',
  SHARE_CALCULATION = 'ShareCalculationTemplate',
}

export class EmailSender {
  static getClassName = () => 'EmailSender';
  private client: SESClient;
  private sourceEmail: string;
  private replyToEmail: string;

  constructor({ sourceEmail, replyToEmail, region }: EmailConfiguration) {
    this.client = new SESClient({ region });
    this.sourceEmail = sourceEmail;
    this.replyToEmail = replyToEmail;
  }

  private async sendTemplateEmail(templateName: EmailTemplate, toEmail: string, templateData: DictionaryType): Promise<void> {
    const command = new SendTemplatedEmailCommand({
      Destination: {
        ToAddresses: [toEmail],
      },
      Template: templateName,
      TemplateData: JSON.stringify(templateData),
      Source: this.sourceEmail,
      ReplyToAddresses: [this.replyToEmail],
    });

    await this.client.send(command);
  }

  async sendNotificationEmail(toEmail: string, subject: string, body: string): Promise<void> {
    await this.sendTemplateEmail(EmailTemplate.NOTIFICATION, toEmail, { subject, body });
  }

  async sendShareCalculationEmail(toEmail: string, subject: string, body: string): Promise<void> {
    await this.sendTemplateEmail(EmailTemplate.SHARE_CALCULATION, toEmail, { subject, body });
  }
}

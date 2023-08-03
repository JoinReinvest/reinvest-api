import { EmailSender } from 'Notifications/Adapter/SES/EmailSender';

export class EmailController {
  private emailSender: EmailSender;

  constructor(emailSender: EmailSender) {
    this.emailSender = emailSender;
  }

  static getClassName = () => 'EmailController';

  async sendEmail(to: string, body: string) {
    await this.emailSender.sendShareCalculationEmail(to, 'Shared calculation', body);

    return 'success';
  }
}

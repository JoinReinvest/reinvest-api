import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { OneTimeToken } from 'Identity/Domain/OneTimeToken';

export type SNSConfig = {
  originationNumber: string;
  region: string;
};

export class SmsService {
  private config: SNSConfig;

  constructor(config: SNSConfig) {
    this.config = config;
  }

  public static getClassName = (): string => 'SmsService';

  public async sendSmsWithToken(oneTimeToken: OneTimeToken) {
    const sms = oneTimeToken.getSms();
    const client = new SNSClient({
      region: this.config.region,
    });
    const commandPayload = {
      Message: `Your authentication code is ${sms.code}`,
      PhoneNumber: sms.phoneNumber,
      MessageAttributes: {},
    };

    if (oneTimeToken.doesRequireOriginationNumber()) {
      commandPayload.MessageAttributes['AWS.MM.SMS.OriginationNumber'] = {
        DataType: 'String',
        StringValue: this.config.originationNumber,
      };
    }

    const command = new PublishCommand(commandPayload);
    await client.send(command);

    return true;
  }
}

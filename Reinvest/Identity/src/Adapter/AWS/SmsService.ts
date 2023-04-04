import {OneTimeToken} from "Identity/Domain/OneTimeToken";
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";
import {PublishCommandInput} from "@aws-sdk/client-sns/dist-types/commands/PublishCommand";

export type SNSConfig = {
    region: string,
    originationNumber: string,
}

export class SmsService {
    public static getClassName = (): string => "SmsService";
    private config: SNSConfig;

    constructor(config: SNSConfig) {
        this.config = config;
    }

    public async sendSmsWithToken(oneTimeToken: OneTimeToken) {
        const sms = oneTimeToken.getSms();
        const client = new SNSClient({
            region: this.config.region
        });
        const commandPayload = {
            Message: `Your authentication code is ${sms.code}`,
            PhoneNumber: sms.phoneNumber,
            MessageAttributes: {}
        }
        if (oneTimeToken.doesRequireOriginationNumber()) {
            // @ts-ignore
            commandPayload.MessageAttributes["AWS.MM.SMS.OriginationNumber"] = {
                DataType: 'String',
                StringValue: this.config.originationNumber,
            };
        }
        const command = new PublishCommand(commandPayload);
        await client.send(command);

        return true;
    }
}
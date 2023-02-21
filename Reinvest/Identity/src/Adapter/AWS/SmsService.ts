import {PhoneNumber} from "Identity/Domain/PhoneNumber";
import {OneTimeToken} from "Identity/Domain/OneTimeToken";
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";

export type SNSConfig = {
    region: string,
}

export class SmsService {
    public static getClassName = (): string => "SmsService";
    private config: SNSConfig;

    constructor(config: SNSConfig) {
        this.config = config;
    }

    public async sendSmsWithToken(oneTimeToken: OneTimeToken) {
        const phoneNumber = oneTimeToken.getPhoneNumber();
        const client = new SNSClient({
            region: this.config.region
        });
        const token = oneTimeToken.getToken();
        const command = new PublishCommand({
            Message: `Your authentication code is ${token}`,
            PhoneNumber: phoneNumber.getFullPhoneNumber(),
        });
        await client.send(command);

        return true;
    }
}
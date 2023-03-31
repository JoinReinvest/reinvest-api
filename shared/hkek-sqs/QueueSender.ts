import {SQSClient, SendMessageCommand} from "@aws-sdk/client-sqs";

export type QueueConfig = {
    region: string,
    queueUrl: string,
    isLocal: boolean,
}

export class QueueSender {
    static getClassName = (): string => 'QueueSender';
    private sqs: SQSClient;
    private queueUrl: string;

    constructor(config: QueueConfig) {
        const {region, queueUrl, isLocal} = config;
        this.queueUrl = queueUrl;
        const SQSConfig = {
            region,
        }

        if (isLocal) {
            
            SQSConfig.endpoint = 'http://localhost:9324';
        }
        this.sqs = new SQSClient(SQSConfig);
    }

    async send(message: string): Promise<void> {
        const params = {
            MessageBody: message,
            QueueUrl: this.queueUrl
        };

        try {
            await this.sqs.send(new SendMessageCommand(params));
        } catch (error: any) {
            console.error(error.message);
        }
    }
}

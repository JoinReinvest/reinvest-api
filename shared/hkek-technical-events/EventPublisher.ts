import SQS from 'aws-sdk/clients/sqs';

const domain = 'http://localhost:9324/queue';
const queueUrl = `${domain}/notification`;

export class EventPublisher {
    api: SQS;

    constructor() {
        this.api = new SQS();
    }

    async publish(message: string) {
        return this.api
            .sendMessage({
                DelaySeconds: 1,
                MessageBody: message,
                QueueUrl: queueUrl,
            })
            .promise();
    }
}

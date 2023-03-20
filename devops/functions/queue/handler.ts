import {boot} from "Reinvest/bootstrap";
import {SQSHandler, SQSEvent, SQSRecord} from 'aws-lambda';
import {Inbox} from "Reinvest/Inbox";

export const main: SQSHandler = async (event: SQSEvent) => {
    console.log('handled event', JSON.stringify(event));
    const modules = boot();
    const record = event.Records.pop() as SQSRecord;
    const inbox = new Inbox(modules)
    inbox.process(record);
};

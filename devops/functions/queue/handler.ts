import { SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda';
import { boot } from 'Reinvest/bootstrap';
import { Inbox } from 'Reinvest/Inbox';

export const main: SQSHandler = async (event: SQSEvent) => {
  const modules = boot();
  const record = event.Records.pop() as SQSRecord;
  const inbox = new Inbox(modules);
  await inbox.process(record);
};

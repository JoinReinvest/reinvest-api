import { SQSRecord } from 'aws-lambda';
import Modules from 'Reinvest/Modules';

export class Inbox {
  private modules: Modules;

  constructor(modules: Modules) {
    this.modules = modules;
  }

  async process(record: SQSRecord) {
    try {
      const messageId = record.messageId;
      const message = JSON.parse(record.body);
      const kind = message.kind;
      console.log({ kind, message, messageId });

      for (const module of this.modules.iterate()) {
        if (module.isHandleEvent(kind)) {
          const handlers = module.technicalEventHandler();
          await handlers[kind](message);
        } else if (module.isHandleEvent('all')) {
          // wildcard
          const handlers = module.technicalEventHandler();
          await handlers.all(message);
        }
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      await this.modules.close();
    }
  }
}

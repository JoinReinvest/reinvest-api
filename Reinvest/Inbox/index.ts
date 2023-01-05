import Modules from "Reinvest/Modules";
import {SQSRecord} from "aws-lambda";

export class Inbox {
    private modules: Modules;

    constructor(modules: Modules) {
        this.modules = modules;
    }

    process(record: SQSRecord) {
        try {
            const messageId = record.messageId;
            const message = JSON.parse(record.body);
            const kind = message.kind;
            // console.log({kind, message, messageId});
            for (let module of this.modules.iterate()) {
                if (module.isHandleEvent(kind)) {
                    module.technicalEventHandler()[kind](message);
                } else if (module.isHandleEvent('all')) { // wildcard
                    module.technicalEventHandler().all(message);
                }

            }
        } catch (error: any) {
            console.error(error);
        }
    }
}
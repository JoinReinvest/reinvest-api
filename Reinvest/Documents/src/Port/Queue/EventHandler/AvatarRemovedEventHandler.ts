import {EventHandler} from "SimpleAggregator/EventBus/EventBus";
import {DomainEvent} from "SimpleAggregator/Types";
import {S3Adapter} from "Documents/Adapter/S3/S3Adapter";
import {FileType} from "Documents/Adapter/S3/FileLinkService";

export class AvatarRemovedEventHandler implements EventHandler<DomainEvent> {
    static getClassName = (): string => 'AvatarRemovedEventHandler';
    private s3Adapter: S3Adapter;


    constructor(s3Adapter: S3Adapter) {
        this.s3Adapter = s3Adapter;
    }

    public async handle(event: DomainEvent): Promise<void> {
        if (event.kind !== 'LegalEntityAvatarRemoved') {
            return;
        }

        const {id: documentId, data: {path}} = event;


        console.log('avatar remove handler in documents', event);
        await this.s3Adapter.deleteFile(path, documentId, FileType.AVATAR);
    }
}
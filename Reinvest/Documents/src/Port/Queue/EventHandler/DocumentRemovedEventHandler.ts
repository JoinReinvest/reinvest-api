import { FileType } from 'Documents/Adapter/S3/FileLinkService';
import { S3Adapter } from 'Documents/Adapter/S3/S3Adapter';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class DocumentRemovedEventHandler implements EventHandler<DomainEvent> {
  static getClassName = (): string => 'DocumentRemovedEventHandler';
  private s3Adapter: S3Adapter;

  constructor(s3Adapter: S3Adapter) {
    this.s3Adapter = s3Adapter;
  }

  public async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'LegalEntityDocumentRemoved') {
      return;
    }

    const {
      id: documentId,
      data: { path },
    } = event;

    await this.s3Adapter.deleteFile(path, documentId, FileType.DOCUMENT);
  }
}

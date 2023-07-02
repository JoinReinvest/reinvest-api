import { DocumentsDatabaseAdapterProvider, documentsRenderedPagePdfTable } from 'Documents/Adapter/Database/DatabaseAdapter';
import { RenderPageToPdfCreate } from 'Documents/UseCases/RenderPageToPdf';
import { UUID } from 'HKEKTypes/Generics';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class DocumentsPdfPageRepository {
  public static getClassName = (): string => 'DocumentsPdfPageRepository';

  private documentsDatabaseAdapterProvider: DocumentsDatabaseAdapterProvider;
  private eventsPublisher: SimpleEventBus;

  constructor(documentsDatabaseAdapterProvider: DocumentsDatabaseAdapterProvider, eventsPublisher: SimpleEventBus) {
    this.documentsDatabaseAdapterProvider = documentsDatabaseAdapterProvider;
    this.eventsPublisher = eventsPublisher;
  }

  async getAllByProfileId(profileId: UUID) {
    try {
      const list = await this.documentsDatabaseAdapterProvider
        .provide()
        .selectFrom(documentsRenderedPagePdfTable)
        .select(['id', 'url', 'name'])
        .where('profileId', '=', profileId)
        .execute();

      return list;
    } catch (err: any) {
      return [];
    }
  }

  async create(renderedPage: RenderPageToPdfCreate) {
    const { id, profileId, dateCreated, name, url } = renderedPage;
    try {
      await this.documentsDatabaseAdapterProvider
        .provide()
        .insertInto(documentsRenderedPagePdfTable)
        .values({
          id,
          profileId,
          dateCreated,
          name,
          url,
        })
        .execute();

      return true;
    } catch (err: any) {
      return false;
    }
  }

  async publishEvents(events: DomainEvent[] = []): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.eventsPublisher.publishMany(events);
  }
}

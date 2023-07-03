import { ArchivingDatabaseAdapterProvider, archivingRenderedPagePdfTable } from 'Archiving/Adapter/Database/DatabaseAdapter';
import { RenderPageToPdfCreate } from 'Archiving/UseCases/RenderPageToPdf';
import { Pagination, UUID } from 'HKEKTypes/Generics';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { DateTime } from 'Money/DateTime';

export class ArchivingRepository {
  public static getClassName = (): string => 'ArchivingPdfPageRepository';

  private archivingDatabaseAdapterProvider: ArchivingDatabaseAdapterProvider;
  private eventsPublisher: SimpleEventBus;

  constructor(archivingDatabaseAdapterProvider: ArchivingDatabaseAdapterProvider, eventsPublisher: SimpleEventBus) {
    this.archivingDatabaseAdapterProvider = archivingDatabaseAdapterProvider;
    this.eventsPublisher = eventsPublisher;
  }

  async getAllByProfileId(profileId: UUID, pagination: Pagination) {
    try {
      const list = await this.archivingDatabaseAdapterProvider
        .provide()
        .selectFrom(archivingRenderedPagePdfTable)
        .select(['id', 'url', 'name', 'dateCreated', 'dateGenerated'])
        .where('profileId', '=', profileId)
        .orderBy('dateCreated', 'desc')
        .limit(pagination.perPage)
        .offset(pagination.perPage * pagination.page)
        .execute();

      return list.map(item => ({
        ...item,
        dateCreated: DateTime.from(item.dateCreated).toIsoDateTime(),
        dateGenerated: item.dateGenerated ? DateTime.from(item.dateGenerated).toIsoDateTime() : null,
      }));
    } catch (err: any) {
      return [];
    }
  }

  async create(renderedPage: RenderPageToPdfCreate) {
    const { id, profileId, dateCreated, name, url } = renderedPage;
    try {
      await this.archivingDatabaseAdapterProvider
        .provide()
        .insertInto(archivingRenderedPagePdfTable)
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

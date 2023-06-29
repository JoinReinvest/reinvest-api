import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DateTime } from 'Money/DateTime';
import { StoredEventRepository } from 'Notifications/Adapter/Database/Repository/StoredEventRepository';
import { StoredEvent } from 'Notifications/Domain/StoredEvent';
import { EventHandler, STORE_EVENT_COMMAND, StoreEventCommand } from 'SimpleAggregator/EventBus/EventBus';

export class StoreEventsHandler implements EventHandler<StoreEventCommand> {
  static getClassName = (): string => 'StoreEventsHandler';
  private storedEventsRepository: StoredEventRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(storedEventsRepository: StoredEventRepository, idGenerator: IdGeneratorInterface) {
    this.storedEventsRepository = storedEventsRepository;
    this.idGenerator = idGenerator;
  }

  public async handle(event: StoreEventCommand): Promise<void> {
    if (event.kind !== STORE_EVENT_COMMAND) {
      return;
    }

    const {
      data: { kind, payload, date },
      id: profileId,
    } = event;

    const id = this.idGenerator.createUuid();
    const storedEvent = StoredEvent.create(id, profileId, kind, payload, DateTime.from(date));
    await this.storedEventsRepository.store(storedEvent);

    console.log('store events handler', event);
  }
}

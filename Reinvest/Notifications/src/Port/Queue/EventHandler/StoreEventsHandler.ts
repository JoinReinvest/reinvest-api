import { EventHandler, STORE_EVENT_COMMAND, StoreEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { StoredEvent } from 'Notifications/Domain/StoredEvent';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';

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
      data: { kind, payload },
      id: profileId,
    } = event;

    const id = this.idGenerator.createUuid();
    const storedEvent = StoredEvent.create(id, profileId, kind, payload);
    await this.storedEventsRepository.store(storedEvent);

    console.log('store events handler', event);
  }
}

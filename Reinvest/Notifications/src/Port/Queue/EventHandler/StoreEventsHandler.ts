import { CreateStoredEvent } from 'Notifications/Application/UseCase/CreateStoredEvent';
import { EventHandler, STORE_EVENT_COMMAND, StoreEventCommand } from 'SimpleAggregator/EventBus/EventBus';

export class StoreEventsHandler implements EventHandler<StoreEventCommand> {
  static getClassName = (): string => 'StoreEventsHandler';
  private createStoredEventUseCase: CreateStoredEvent;

  constructor(createStoredEventUseCase: CreateStoredEvent) {
    this.createStoredEventUseCase = createStoredEventUseCase;
  }

  public async handle(event: StoreEventCommand): Promise<void> {
    if (event.kind !== STORE_EVENT_COMMAND) {
      return;
    }

    const {
      data: { kind, payload, date },
      id: profileId,
    } = event;

    await this.createStoredEventUseCase.execute(profileId, kind, payload, date);

    console.log('store events handler', event);
  }
}

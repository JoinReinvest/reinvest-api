import { EventHandler, StoreEventCommand } from 'SimpleAggregator/EventBus/EventBus';

export class StoreEventsHandler implements EventHandler<StoreEventCommand> {
  static getClassName = (): string => 'StoreEventsHandler';

  public async handle(event: StoreEventCommand): Promise<void> {
    console.log('store events handler', event);
  }
}

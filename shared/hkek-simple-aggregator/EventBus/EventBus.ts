import { ContainerInterface } from 'Container/Container';
import { DomainEvent } from 'SimpleAggregator/Types';

export interface EventHandler<Event extends DomainEvent> {
  handle(event: Event): Promise<void>;
}

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;

  publishMany(events: DomainEvent[]): Promise<void>;

  subscribe(forKind: string, handler: string): this;

  subscribeHandlerForKinds(handler: string, forKinds: string[]): this;
}

export class SimpleEventBus implements EventBus {
  static getClassName = (): string => 'EventBus';

  private handlers: {
    [kind: string]: string[];
  } = {};
  private container: ContainerInterface;

  constructor(container: ContainerInterface) {
    this.container = container;
  }

  public async publish(event: DomainEvent): Promise<void> {
    const kind = event.kind;

    if (!(kind in this.handlers)) {
      return;
    }

    const handlersForKind = this.handlers[kind];

    for (const handlerName of handlersForKind) {
      const handler = this.container.getValue(handlerName) as EventHandler<any>;
      await handler.handle(event);
    }

    return;
  }

  public async publishMany(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }

    return;
  }

  public subscribe(forKind: string, handler: string): this {
    this.addHandlerForKind(forKind, handler);

    return this;
  }

  public subscribeHandlerForKinds(handler: string, forKinds: string[]): this {
    for (const kind of forKinds) {
      this.addHandlerForKind(kind, handler);
    }

    return this;
  }

  private addHandlerForKind(forKind: string, handler: string): void {
    if (!(forKind in this.handlers)) {
      this.handlers[forKind] = [];
    }

    this.handlers[forKind].push(handler);
  }
}

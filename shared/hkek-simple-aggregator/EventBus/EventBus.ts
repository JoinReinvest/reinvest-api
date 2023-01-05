import {DomainEvent} from "SimpleAggregator/Types";
import {ContainerInterface} from "Container/Container";

export interface EventHandler<Event extends DomainEvent> {
    handle(event: Event): void;
}

export interface EventBus {
    publish(event: DomainEvent): this;

    subscribe(forKind: string, handler: string): this;

    subscribeHandlerForKinds(handler: string, forKinds: string[]): this;
}

export class SimpleEventBus implements EventBus {
    static toString = () => 'EventBus';

    private handlers: {
        [kind: string]: string[]
    } = {};
    private container: ContainerInterface;

    constructor(container: ContainerInterface) {
        this.container = container;
    }

    public publish(event: DomainEvent): this {
        const kind = event.kind;
        if (!(kind in this.handlers)) {
            return this;
        }

        for (let handlerName of this.handlers[kind]) {
            const handler = this.container.getValue(handlerName) as EventHandler<any>;
            handler.handle(event);
        }

        return this;
    }

    public subscribe(forKind: string, handler: string): this {
        this.addHandlerForKind(forKind, handler);

        return this;
    }

    public subscribeHandlerForKinds(handler: string, forKinds: string[]): this {
        for (let kind of forKinds) {
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
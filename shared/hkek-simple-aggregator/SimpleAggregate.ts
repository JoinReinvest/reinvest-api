import {AggregateState, DomainEvent} from "./Types";
import Aggregate from "./Aggregate";

export class SimpleAggregate implements Aggregate {
    protected aggregate: AggregateState;

    constructor(aggregate: AggregateState) {
        this.aggregate = aggregate;
    }

    protected static createAggregate<T extends typeof SimpleAggregate>(this: T, kind: string, aggregateId: string): InstanceType<T> {
        const aggregateState = {
            kind,
            dateCreated: new Date(),
            dateUpdated: new Date(),
            aggregateId,
            currentVersion: 0,
            previousVersion: 0
        } as AggregateState;

        return (new this(aggregateState)) as InstanceType<T>;
    }

    public static restoreAggregate<T extends typeof SimpleAggregate>(this: T, state: AggregateState): InstanceType<T> {
        return (new this(state)) as InstanceType<T>;
    }

    protected getState(key: string) {
        return key in this.aggregate.state ? this.aggregate.state[key] : null;
    }

    protected getId(): string {
        return this.aggregate.aggregateId;
    }

    // event apply
    public apply<Event extends DomainEvent>(event: Event): Event {
        if (!('state' in this.aggregate)) {
            this.aggregate.state = {};
        }

        this.aggregate.state = {...this.aggregate.state, ...event.data};
        this.aggregate.currentVersion++;
        return <Event>event;
    }

    public getSnapshot(): AggregateState {
        return {...this.aggregate};
    }
}
import {AggregateState, DomainEvent} from "./Types";
import Aggregate from "./Aggregate";

export class SimpleAggregate implements Aggregate {
    protected aggregate: AggregateState;

    constructor(aggregate: AggregateState) {
        this.aggregate = aggregate;
    }

    protected static createAggregate<T extends typeof SimpleAggregate>(this: T, kind: string): InstanceType<T> {
        const aggregateState = {
            kind,
            dateCreated: new Date(),
            aggregateId: 'testAggregateId',
            version: 1,
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
    public apply<Event>(event: DomainEvent): Event {
        if (!('state' in this.aggregate)) {
            this.aggregate.state = {};
        }

        this.aggregate.state = {...this.aggregate.state, ...event.data};
        this.aggregate.version++;
        return <Event>event;
    }

    public getSnapshot(): AggregateState {
        const aggregate = {...this.aggregate};

        aggregate.state = JSON.stringify(aggregate.state);
        return aggregate;
    }
}
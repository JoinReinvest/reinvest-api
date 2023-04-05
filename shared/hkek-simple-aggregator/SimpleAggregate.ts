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

    protected getState(key: string, defaultValue: any = null) {
        return key in this.aggregate.state ? this.aggregate.state[key] : defaultValue;
    }

    protected getId(): string {
        return this.aggregate.aggregateId;
    }

    protected deepCopy<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    // event apply
    public apply<Event extends DomainEvent>(event: Event): Event {
        if (!('state' in this.aggregate)) {
            this.aggregate.state = {};
        }
        const stateCopy = this.deepCopy(this.aggregate.state);
        const eventCopy = this.deepCopy(event);

        this.aggregate.state = {...stateCopy, ...eventCopy.data};
        this.aggregate.currentVersion++;
        return <Event>event;
    }

    public getSnapshot(): AggregateState {
        return {...this.aggregate};
    }
}
import {AggregateState, DomainEvent} from "./Types";

export default interface Aggregate {
    apply<Event>(event: DomainEvent): Event;

    getSnapshot(): AggregateState;
}
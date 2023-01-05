import {AggregateState, DomainEvent} from "./Types";

export default interface Aggregate {
    apply<Event extends DomainEvent>(event: Event): Event;

    getSnapshot(): AggregateState;
}
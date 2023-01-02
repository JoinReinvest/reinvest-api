import CommandType from "./CommandType";
import DomainEventType from "./DomainEventType";
import {AggregateState} from "./AggregateState";

export default interface Aggregate {
    execute(command: CommandType): DomainEventType | DomainEventType[];

    apply(event: DomainEventType): DomainEventType;

    getSnapshot(): AggregateState;
}
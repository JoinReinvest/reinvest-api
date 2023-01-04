export type AggregateState = {
    kind: string,
    dateCreated: Date,
    aggregateId: string,
    version: number,
    previousVersion: number,
    state?: any,
}

export type Uninitialized = null;

export type DomainEvent = {
    id: string;
    kind: string,
    data: any
}
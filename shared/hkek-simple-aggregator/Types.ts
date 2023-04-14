export type AggregateState = {
    kind: string,
    dateCreated: Date,
    dateUpdated: Date,
    aggregateId: string,
    currentVersion: number,
    previousVersion: number,
    state?: any,
}

export type DomainEvent = {
    id: string;
    kind: string,
    data?: unknown,
}
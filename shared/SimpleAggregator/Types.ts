export type AggregateState = {
    kind: string,
    dateCreated: string,
    aggregateId: string,
    version: number,
    previousVersion: number,
    state?: any,
}

export type Uninitialized = null;

export interface DomainEventInterface {
    id: string;
    kind: string,
    data: any
}

export abstract class DomainEvent {
    public data: Uninitialized | any;
    public id: string;

    constructor(data: any, id: string) {
        this.id = id;
        this.data = data;
    }

    isUninitialized() {
        return this.data === null;
    }
}
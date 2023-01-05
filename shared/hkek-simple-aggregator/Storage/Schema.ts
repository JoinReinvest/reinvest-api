export interface AggregateTable {
    aggregateId: string;
    dateCreated: string,
    version: number;
    previousVersion: number,
    kind: string,
    state: string
}
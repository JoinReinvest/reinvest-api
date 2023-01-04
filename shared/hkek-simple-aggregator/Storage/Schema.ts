export interface AggregateTable {
    aggregateId: string;
    dateCreate: string,
    version: number;
    previousVersion: number,
    kind: string,
    state: string
}
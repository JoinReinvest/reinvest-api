export type AggregateState = {
  aggregateId: string;
  currentVersion: number;
  dateCreated: Date;
  dateUpdated: Date;
  kind: string;
  previousVersion: number;
  state?: any;
};

export type DomainEvent = {
  id: string;
  kind: string;
  data?: unknown;
};

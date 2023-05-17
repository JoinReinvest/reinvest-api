export enum TransactionDecisions {
  CREATE_TRADE = 'CREATE_TRADE',
}

export type TransactionDecision = {
  date: Date;
  decisionId: number;
  kind: TransactionDecisions;
  state: unknown;
};

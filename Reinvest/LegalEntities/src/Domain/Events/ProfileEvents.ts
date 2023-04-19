import { DomainEvent } from 'SimpleAggregator/Types';

export type LegalProfileCompleted = DomainEvent & {
  kind: 'LegalProfileCompleted';
};

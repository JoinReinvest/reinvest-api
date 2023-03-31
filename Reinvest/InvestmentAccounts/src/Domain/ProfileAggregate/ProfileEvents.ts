import { DomainEvent } from 'SimpleAggregator/Types';

export type ProfileCreated = DomainEvent & {
  data: {
    corporateAccountIds: [];
    individualAccountId: null;
    trustAccountIds: [];
  };
  kind: 'ProfileCreated';
};

export type IndividualAccountOpened = DomainEvent & {
  data: {
    individualAccountId: string;
  };
  kind: 'IndividualAccountOpened';
};

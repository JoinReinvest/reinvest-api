import { DomainEvent } from 'SimpleAggregator/Types';

export type ProfileCreated = DomainEvent & {
  data: {
    beneficiaryAccountIds: [];
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

export type CorporateAccountOpened = DomainEvent & {
  data: {
    corporateAccountIds: string[];
  };
  kind: 'CorporateAccountOpened';
};

export type TrustAccountOpened = DomainEvent & {
  data: {
    trustAccountIds: string[];
  };
  kind: 'TrustAccountOpened';
};

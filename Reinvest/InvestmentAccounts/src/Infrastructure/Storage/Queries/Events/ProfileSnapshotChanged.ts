import { ProfileState } from 'InvestmentAccounts/Domain/ProfileAggregate/Profile';
import { DomainEvent } from 'SimpleAggregator/Types';

export type ProfileSnapshotChanged = DomainEvent & {
  data: ProfileState['state'];
  kind: 'ProfileSnapshotChanged';
};

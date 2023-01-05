import {DomainEvent} from "SimpleAggregator/Types";
import {ProfileState} from "InvestmentAccounts/Profile";

export type ProfileSnapshotChanged = DomainEvent & {
    kind: 'ProfileSnapshotChanged',
    data: ProfileState["state"]
}
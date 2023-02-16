import {DomainEvent} from "SimpleAggregator/Types";
import {ProfileState} from "InvestmentAccounts/Domain/Profile";

export type ProfileSnapshotChanged = DomainEvent & {
    kind: 'ProfileSnapshotChanged',
    data: ProfileState["state"]
}
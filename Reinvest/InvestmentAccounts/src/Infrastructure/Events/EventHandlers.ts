import {EventHandler} from "SimpleAggregator/EventBus/EventBus";
import {ProfileQuery} from "InvestmentAccounts/Infrastructure/Storage/Queries/ProfileQuery";
import {ProfileSnapshotChanged} from "InvestmentAccounts/Infrastructure/Storage/Queries/Events/ProfileSnapshotChanged";

export class ProfileQueryEventHandler implements EventHandler<ProfileSnapshotChanged> {
    static getClassName = (): string => 'ProfileQueryEventHandler';
    private profileQuery: ProfileQuery;

    constructor(profileQuery: ProfileQuery) {
        this.profileQuery = profileQuery;
    }

    async handle(event: ProfileSnapshotChanged): Promise<void> {
        await this.profileQuery.update(event);
    }
}
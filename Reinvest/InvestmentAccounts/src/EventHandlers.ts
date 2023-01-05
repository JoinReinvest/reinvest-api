import {EventHandler} from "SimpleAggregator/EventBus/EventBus";
import {ProfileQuery} from "InvestmentAccounts/Storage/Queries/ProfileQuery";
import {ProfileSnapshotChanged} from "InvestmentAccounts/Storage/Queries/Events/ProfileSnapshotChanged";

export class ProfileQueryEventHandler implements EventHandler<ProfileSnapshotChanged> {
    static toString = () => 'ProfileQueryEventHandler';

    async handle(event: ProfileSnapshotChanged): Promise<void> {
        const profileQuery = new ProfileQuery();
        await profileQuery.update(event);
    }
}
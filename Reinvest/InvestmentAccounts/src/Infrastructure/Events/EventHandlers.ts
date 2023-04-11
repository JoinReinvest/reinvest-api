import { ProfileSnapshotChanged } from 'InvestmentAccounts/Infrastructure/Storage/Queries/Events/ProfileSnapshotChanged';
import { ProfileQuery } from 'InvestmentAccounts/Infrastructure/Storage/Queries/ProfileQuery';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';

export class ProfileQueryEventHandler implements EventHandler<ProfileSnapshotChanged> {
  private profileQuery: ProfileQuery;

  constructor(profileQuery: ProfileQuery) {
    this.profileQuery = profileQuery;
  }

  static getClassName = (): string => 'ProfileQueryEventHandler';

  async handle(event: ProfileSnapshotChanged): Promise<void> {
    await this.profileQuery.update(event);
  }
}

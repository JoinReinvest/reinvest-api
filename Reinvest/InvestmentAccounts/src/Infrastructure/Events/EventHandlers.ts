import { ProfileSnapshotChanged } from 'InvestmentAccounts/Infrastructure/Storage/Queries/Events/ProfileSnapshotChanged';
import { ProfileQuery } from 'InvestmentAccounts/Infrastructure/Storage/Queries/ProfileQuery';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';

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

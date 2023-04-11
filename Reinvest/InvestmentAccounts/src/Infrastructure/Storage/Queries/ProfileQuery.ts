import { InvestmentAccountDbProvider } from 'InvestmentAccounts/Infrastructure/Storage/DatabaseAdapter';
import { ProfileSnapshotChanged } from 'InvestmentAccounts/Infrastructure/Storage/Queries/Events/ProfileSnapshotChanged';

export interface ProfileQueryTable {
  data: string;
  profileId: string;
  userId: string;
}

type ProfileQueryStructure = {
  data: {
    avatarUrl: string;
    id: string;
    userId: string;
  };
  filters: {
    profileId?: string;
    userId?: string;
  };
};

export class ProfileQuery {
  private databaseProvider: InvestmentAccountDbProvider;

  constructor(databaseProvider: InvestmentAccountDbProvider) {
    this.databaseProvider = databaseProvider;
  }

  static getClassName = (): string => 'ProfileQuery';

  async getQuery(filters: ProfileQueryStructure['filters']): Promise<any> {
    const database = this.databaseProvider.provide();

    let profileQuery = database.selectFrom('investment_accounts_profile_query').select(['userId', 'data']);

    for (const filter in filters) {
      profileQuery = profileQuery.where(filter, '=', filters[filter]);
    }

    const profile = await profileQuery.executeTakeFirst();

    if (!profile) {
      return null;
    }

    // profile.data = JSON.parse(profile.data);

    return profile;
  }

  async update(event: ProfileSnapshotChanged): Promise<void> {
    switch (event.kind) {
      case 'ProfileSnapshotChanged':
        await this.updateProfileQuery(event.id, event.data);
        break;
      default:
        break;
    }
  }

  private async updateProfileQuery(id: string, data: ProfileSnapshotChanged['data']) {
    const query = await this.getQuery({ profileId: id });
    const database = this.databaseProvider.provide();

    if (!query) {
      const dataToInsert = {
        id,
        userId: data.userId,
        avatarUrl: 'empty-url',
      };
      const insertQuery = {
        profileId: id,
        userId: data.userId,
        data: JSON.stringify(dataToInsert),
      };
      await database
        .insertInto('investment_accounts_profile_query')
        .values({ ...insertQuery })
        .execute();
    } else {
      query.userId = data.userId;
      const dataToUpdate = {
        id,
        email: data.email,
        userId: data.userId,
        avatarUrl: 'empty-url-updated',
      };

      query.data = JSON.stringify(dataToUpdate);

      await database
        .updateTable('investment_accounts_profile_query')
        .set({ ...query })
        .where('profileId', '=', id)
        .execute();
    }
  }
}

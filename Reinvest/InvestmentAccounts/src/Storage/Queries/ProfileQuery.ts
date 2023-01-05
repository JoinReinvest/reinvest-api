import {ProfileSnapshotChanged} from "InvestmentAccounts/Storage/Queries/Events/ProfileSnapshotChanged";
import {DbProvider} from "InvestmentAccounts/Storage/DatabaseAdapter";

export interface ProfileQueryTable {
    profileId: string,
    userId: string,
    data: string,
}

type ProfileQueryStructure = {
    filters: {
        profileId?: string,
        userId?: string,
    }
    data: {
        id: string,
        userId: string,
        avatarUrl: string,
    }
};

export class ProfileQuery {
    async getQuery(filters: ProfileQueryStructure['filters']): Promise<any> {
        const database = DbProvider.provide();

        let profileQuery = database
            .selectFrom('investment_accounts_profile_query')
            .select(['userId', 'data']);

        for (let filter in filters) {
            profileQuery = profileQuery.where(filter, '=', filters[filter])
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
        const query = await this.getQuery({profileId: id});
        const database = DbProvider.provide();
        if (!query) {
            const dataToInsert = {
                id,
                userId: data.userId,
                avatarUrl: 'empty-url'
            };
            const insertQuery = {
                profileId: id,
                userId: data.userId,
                data: JSON.stringify(dataToInsert)
            }
            await database
                .insertInto('investment_accounts_profile_query')
                .values({...insertQuery})
                .execute();


        } else {
            query.userId = data.userId;
            const dataToUpdate = {
                id,
                email: data.email,
                userId: data.userId,
                avatarUrl: 'empty-url-updated'
            };

            query.data = JSON.stringify(dataToUpdate);

            await database
                .updateTable('investment_accounts_profile_query')
                .set({...query})
                .where('profileId', '=', id)
                .execute();
        }
    }
}
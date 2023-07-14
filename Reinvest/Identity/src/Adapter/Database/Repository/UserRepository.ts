import { JSONObjectOf, Pagination, UUID } from 'HKEKTypes/Generics';
import { IdentityDatabaseAdapterProvider, userTable } from 'Identity/Adapter/Database/IdentityDatabaseAdapter';
import { IdentityUser, InsertableUser } from 'Identity/Adapter/Database/IdentitySchema';
import { USER_EXCEPTION_CODES, UserException } from 'Identity/Adapter/Database/UserException';
import { IncentiveToken } from 'Identity/Domain/IncentiveToken';
import { BanList } from 'Identity/Port/Api/BanController';
import { User } from 'Identity/Port/Api/UserController';

export class UserRepository {
  private databaseAdapterProvider: IdentityDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: IdentityDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'UserRepository';

  async registerUser(
    id: string,
    profileId: string,
    userIncentiveToken: IncentiveToken,
    cognitoUserId: string,
    email: string,
    invitedByIncentiveToken: IncentiveToken | null,
  ): Promise<void | never> {
    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(userTable)
        .values(<InsertableUser>{
          id,
          cognitoUserId,
          profileId,
          email,
          invitedByIncentiveToken: invitedByIncentiveToken === null ? null : invitedByIncentiveToken.get(),
          userIncentiveToken: userIncentiveToken.get(),
        })
        .execute();
    } catch (error: any) {
      throw new UserException(USER_EXCEPTION_CODES.USER_ALREADY_EXISTS, `User already exists: ${cognitoUserId}`);
    }
  }

  public async getUserProfile(cognitoUserId: string): Promise<{
    bannedIdsJson: JSONObjectOf<BanList>;
    profileId: string;
  } | null> {
    const user = await this.databaseAdapterProvider
      .provide()
      .selectFrom(userTable)
      .select(['profileId', 'bannedIdsJson'])
      .where('cognitoUserId', '=', cognitoUserId)
      .limit(1)
      .executeTakeFirst();

    return user ?? null;
  }

  public async getUserProfileByProfileId(profileId: string): Promise<{
    bannedIdsJson: JSONObjectOf<BanList>;
    profileId: string;
  } | null> {
    const user = await this.databaseAdapterProvider
      .provide()
      .selectFrom(userTable)
      .select(['profileId', 'bannedIdsJson'])
      .where('profileId', '=', profileId)
      .limit(1)
      .executeTakeFirst();

    return user ?? null;
  }

  public async getUserProfileByEmail(email: string): Promise<string | null> {
    const user = await this.databaseAdapterProvider.provide().selectFrom(userTable).select('profileId').where('email', '=', email).limit(1).executeTakeFirst();

    return user ? user.profileId : null;
  }

  public async updateUserEmail(cognitoUserId: string, email: string) {
    await this.databaseAdapterProvider
      .provide()
      .updateTable(userTable)
      .set({
        email,
      })
      .where('cognitoUserId', '=', cognitoUserId)
      .execute();
  }

  async findUserByProfileId(profileId: string): Promise<IdentityUser | null> {
    const user = await this.databaseAdapterProvider.provide().selectFrom(userTable).selectAll().where('profileId', '=', profileId).limit(1).executeTakeFirst();

    if (!user) {
      return null;
    }

    return user;
  }

  async updateUserBanList(id: string, banList: BanList): Promise<void> {
    await this.databaseAdapterProvider
      .provide()
      .updateTable(userTable)
      .set({
        bannedIdsJson: banList,
      })
      .where('id', '=', id)
      .execute();
  }

  async getUserInviter(inviteeProfileId: UUID): Promise<UUID | null> {
    const result = await this.databaseAdapterProvider
      .provide()
      .selectFrom(`${userTable} as invitee`)
      .fullJoin(`${userTable} as inviter`, `invitee.invitedByIncentiveToken`, 'inviter.userIncentiveToken')
      .select('inviter.profileId as inviterProfileId')
      .where('invitee.profileId', '=', inviteeProfileId)
      .executeTakeFirst();

    return result ? result.inviterProfileId : null;
  }

  async listUsers(pagination: Pagination): Promise<User[]> {
    const result = await this.databaseAdapterProvider
      .provide()
      .selectFrom(userTable)
      .select(['id', 'profileId', 'email', 'createdAt', 'bannedIdsJson'])
      .orderBy('createdAt', 'desc')
      .limit(pagination.perPage)
      .offset(pagination.perPage * pagination.page)
      .execute();

    if (result.length === 0) {
      return [];
    }

    return result.map(user => ({
      id: user.id,
      profileId: user.profileId,
      email: user.email,
      createdAt: user.createdAt,
      // @ts-ignore
      isBanned: user.bannedIdsJson !== null && user.bannedIdsJson.list && user.bannedIdsJson.list.includes(user.profileId),
    }));
  }
}

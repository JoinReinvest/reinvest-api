import { IdentityDatabaseAdapterProvider, userTable } from 'Identity/Adapter/Database/IdentityDatabaseAdapter';
import { InsertableUser } from 'Identity/Adapter/Database/IdentitySchema';
import { USER_EXCEPTION_CODES, UserException } from 'Identity/Adapter/Database/UserException';
import { IncentiveToken } from 'Identity/Domain/IncentiveToken';

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

  public async getUserProfileId(cognitoUserId: string): Promise<string | null> {
    const user = await this.databaseAdapterProvider
      .provide()
      .selectFrom(userTable)
      .select('profileId')
      .where('cognitoUserId', '=', cognitoUserId)
      .limit(1)
      .executeTakeFirst();

    return user ? user.profileId : null;
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
}

import {DatabaseAdapterProvider, userTable} from "Identity/Adapter/Database/DatabaseAdapter";
import {InsertableUser} from "Identity/Adapter/Database/IdentitySchema";
import {USER_EXCEPTION_CODES, UserException} from "Identity/Adapter/Database/UserException";
import {IdGeneratorInterface} from "IdGenerator/IdGenerator";

const INCENTIVE_TOKEN_SIZE = 8;

export class UserRepository {
    public static getClassName = (): string => "UserRepository";
    private databaseAdapterProvider: DatabaseAdapterProvider;
    private idGenerator: IdGeneratorInterface;

    constructor(databaseAdapterProvider: DatabaseAdapterProvider, idGenerator: IdGeneratorInterface) {
        this.databaseAdapterProvider = databaseAdapterProvider;
        this.idGenerator = idGenerator;
    }

    async registerUser(id: string, profileId: string, userIncentiveToken: string, cognitoUserId: string, email: string, invitedByIncentiveToken: string | null): Promise<void|never> {
        try {
            await this.databaseAdapterProvider.provide().insertInto(userTable).values(<InsertableUser>{
                id,
                cognitoUserId,
                profileId,
                email,
                invitedByIncentiveToken,
                userIncentiveToken
            }).execute();
        } catch (error: any) {
            throw new UserException(USER_EXCEPTION_CODES.USER_ALREADY_EXISTS, `User already exists: ${cognitoUserId}`);
        }
    }

    public async generateUniqueIncentiveToken(tries: number = 1): Promise<string> {
        const userIncentiveToken = this.idGenerator.generateRandomString(INCENTIVE_TOKEN_SIZE);
        const doesTokenExist = await this.verifyIncentiveTokenUniqueness(userIncentiveToken);

        if (doesTokenExist) {
            if (tries >= 10) {
                throw new UserException(USER_EXCEPTION_CODES.CANNOT_GENERATE_UNIQUE_TOKEN, "Cannot generate unique incentive token");
            }

            return this.generateUniqueIncentiveToken(tries + 1);
        }

        return userIncentiveToken;
    }

    private async verifyIncentiveTokenUniqueness(userIncentiveToken: string): Promise<boolean> {
        const doesTokenExist = await this.databaseAdapterProvider.provide()
            .selectFrom(userTable)
            .select('cognitoUserId')
            .where('userIncentiveToken', '=', userIncentiveToken)
            .limit(1)
            .executeTakeFirst();

        return !!doesTokenExist;
    }

    public async getUserProfileId(cognitoUserId: string): Promise<string | null> {
        const doesUserExist = await this.databaseAdapterProvider.provide()
            .selectFrom(userTable)
            .select('profileId')
            .where('cognitoUserId', '=', cognitoUserId)
            .limit(1)
            .executeTakeFirst();

        return !!doesUserExist ? doesUserExist.profileId : null;
    }
}
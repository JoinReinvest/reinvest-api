import {IdentityDatabaseAdapterProvider, userTable} from "Identity/Adapter/Database/IdentityDatabaseAdapter";
import {UniqueTokenGeneratorInterface} from "IdGenerator/UniqueTokenGenerator";
import {INCENTIVE_TOKEN_SIZE, IncentiveToken} from "Identity/Domain/IncentiveToken";
import {USER_EXCEPTION_CODES, UserException} from "Identity/Adapter/Database/UserException";


export class IncentiveTokenRepository {
    public static getClassName = (): string => "IncentiveTokenRepository";
    private databaseAdapterProvider: IdentityDatabaseAdapterProvider;
    private uniqueTokenGenerator: UniqueTokenGeneratorInterface;

    constructor(databaseAdapterProvider: IdentityDatabaseAdapterProvider, uniqueTokenGenerator: UniqueTokenGeneratorInterface) {
        this.databaseAdapterProvider = databaseAdapterProvider;
        this.uniqueTokenGenerator = uniqueTokenGenerator;
    }

    public async generateUniqueIncentiveToken(tries: number = 1): Promise<IncentiveToken> {
        const randomString = this.uniqueTokenGenerator.generateRandomString(INCENTIVE_TOKEN_SIZE);
        const userIncentiveToken = new IncentiveToken(randomString)
        const doesTokenExist = await this.verifyIncentiveTokenUniqueness(userIncentiveToken);

        if (doesTokenExist) {
            if (tries >= 10) {
                throw new UserException(USER_EXCEPTION_CODES.CANNOT_GENERATE_UNIQUE_TOKEN, "Cannot generate unique incentive token");
            }

            return this.generateUniqueIncentiveToken(tries + 1);
        }

        return userIncentiveToken;
    }

    async verifyIncentiveTokenUniqueness(userIncentiveToken: IncentiveToken): Promise<boolean> {
        const doesTokenExist = await this.databaseAdapterProvider.provide()
            .selectFrom(userTable)
            .select('cognitoUserId')
            .where('userIncentiveToken', '=', userIncentiveToken.get())
            .limit(1)
            .executeTakeFirst();

        return !!doesTokenExist;
    }

    async getUserIncentiveToken(userId: string): Promise<IncentiveToken | null> {
        const data = await this.databaseAdapterProvider.provide()
            .selectFrom(userTable)
            .select('userIncentiveToken')
            .where('cognitoUserId', '=', userId)
            .limit(1)
            .executeTakeFirst();

        if (!data) {
            return null;
        }

        return new IncentiveToken(data.userIncentiveToken);
    }
}
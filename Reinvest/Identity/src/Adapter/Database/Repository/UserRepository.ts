import {DatabaseAdapterProvider, userTable} from "Identity/Adapter/Database/DatabaseAdapter";
import {IdGeneratorInterface} from "IdGenerator/IdGenerator";
import {InsertableUser} from "Identity/Adapter/Database/IdentitySchema";
import {USER_EXCEPTION_CODES, UserException} from "Identity/Adapter/Database/UserException";

const INCENTIVE_TOKEN_SIZE = 8;

export class UserRepository {
    public static getClassName = (): string => "UserRepository";
    private databaseAdapterProvider: DatabaseAdapterProvider;
    private idGenerator: IdGeneratorInterface;

    constructor(databaseAdapterProvider: DatabaseAdapterProvider, idGenerator: IdGeneratorInterface) {
        this.databaseAdapterProvider = databaseAdapterProvider;
        this.idGenerator = idGenerator;
    }

    async createUser(cognitoUserId: string, email: string, invitedByIncentiveToken: string | null): Promise<string> {
        const id = this.idGenerator.create();
        const profileId = this.idGenerator.create();
        const userIncentiveToken = await this.generateUniqueIncentiveToken();

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

        return profileId;
    }

    async generateUniqueIncentiveToken(): Promise<string> {
        const userIncentiveToken = 'XAXAXAXA';// this.idGenerator.generateRandomString(INCENTIVE_TOKEN_SIZE);

        return userIncentiveToken;
    }
}
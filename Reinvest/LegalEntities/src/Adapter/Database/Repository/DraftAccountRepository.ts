import {
    LegalEntitiesDatabaseAdapterProvider, legalEntitiesDraftAccountTable,
    legalEntitiesProfileTable
} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {Profile, ProfileSchema} from "LegalEntities/Domain/Profile";
import {IdGeneratorInterface} from "IdGenerator/IdGenerator";
import {
    accountDraftFields,
    LegalEntitiesJsonFields,
    LegalEntitiesProfile
} from "LegalEntities/Adapter/Database/LegalEntitiesSchema";
import {SSN} from "LegalEntities/Domain/ValueObject/SSN";
import {AccountType} from "LegalEntities/Domain/AccountType";
import {DraftAccountState} from "LegalEntities/Domain/DraftAccount/DraftAccount";

export class DraftAccountRepository {
    public static getClassName = (): string => "DraftAccountRepository";
    private databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider;
    private idGenerator: IdGeneratorInterface;

    constructor(databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider, uniqueGenerator: IdGeneratorInterface) {
        this.databaseAdapterProvider = databaseAdapterProvider;
        this.idGenerator = uniqueGenerator;
    }

    // private async createProfile(profileId: string, externalId: string | null = null, defaultLabel: string = 'Individual investor') {
    //     externalId = externalId ?? this.idGenerator.createNumericId(9);
    //
    //     const profile = new Profile(profileId, externalId, defaultLabel);
    //     await this.storeProfile(profile);
    //
    //     return profile;
    // }
    //
    // public async findProfile(profileId: string): Promise<Profile | null> {
    //     const data = await this.databaseAdapterProvider.provide()
    //         .selectFrom(legalEntitiesProfileTable)
    //         .select(['profileId', 'externalId', 'label', 'name', 'ssn', 'dateOfBirth', 'address', 'idScan', 'avatar', 'domicile', 'statements', 'investingExperience', 'isCompleted'])
    //         .where('profileId', '=', profileId)
    //         .limit(1)
    //         .executeTakeFirst();
    //
    //     if (!data) {
    //         return null;
    //     }
    //
    //     return Profile.create(data as unknown as ProfileSchema);
    // }

    // async isSSNUnique(ssn: SSN, profileId: string): Promise<boolean> {
    //     const isProfileWithTheSSNExist = await this.databaseAdapterProvider.provide()
    //         .selectFrom(legalEntitiesProfileTable)
    //         .select(['profileId'])
    //         .where('ssn', '=', ssn.toObject())
    //         .where('profileId', '!=', profileId)
    //         .limit(1)
    //         .executeTakeFirst();
    //
    //     return !isProfileWithTheSSNExist;
    // }
    async getActiveDraftsOfType(type: AccountType): Promise<{ id: string, type: AccountType }[]> {
        const data = await this.databaseAdapterProvider.provide()
            .selectFrom(legalEntitiesDraftAccountTable)
            .select(accountDraftFields)
            .where('accountType', '=', type)
            .where('state', '=', DraftAccountState.ACTIVE)
            .execute();

        if (!data) {
            return null;
        }
        return []
    }

    async createNewDraftAccount(draftId: string, profileId: string, type: AccountType): Promise<boolean> {
        try {
            await this.databaseAdapterProvider.provide()
                .insertInto(legalEntitiesDraftAccountTable)
                .values({
                    draftId,
                    profileId,
                    accountType: type,
                    state: DraftAccountState.ACTIVE,
                    data: null
                })
                .returning('draftId')
                .executeTakeFirstOrThrow();

            return true;
        } catch (error: any) {
            console.error(`Cannot create draft account: ${error.message}`);
            return false;
        }
    }
}
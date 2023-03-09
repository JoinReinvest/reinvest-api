import {
    LegalEntitiesDatabaseAdapterProvider,
    legalEntitiesProfileTable
} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {Profile, ProfileSchema} from "LegalEntities/Domain/Profile";
import {IdGeneratorInterface} from "IdGenerator/IdGenerator";
import {
    LegalEntitiesJsonFields,
    LegalEntitiesProfile
} from "LegalEntities/Adapter/Database/LegalEntitiesSchema";
import {SSN} from "LegalEntities/Domain/ValueObject/SSN";

export class ProfileRepository {
    public static getClassName = (): string => "ProfileRepository";
    private databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider;
    private idGenerator: IdGeneratorInterface;

    constructor(databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider, uniqueGenerator: IdGeneratorInterface) {
        this.databaseAdapterProvider = databaseAdapterProvider;
        this.idGenerator = uniqueGenerator;
    }

    private async createProfile(profileId: string, externalId: string | null = null, defaultLabel: string = 'Individual investor') {
        externalId = externalId ?? this.idGenerator.createNumericId(9);

        const profile = new Profile(profileId, externalId, defaultLabel);
        await this.storeProfile(profile);

        return profile;
    }

    public async findProfile(profileId: string): Promise<Profile | null> {
        const data = await this.databaseAdapterProvider.provide()
            .selectFrom(legalEntitiesProfileTable)
            .select(['profileId', 'externalId', 'label', 'name', 'ssn', 'dateOfBirth', 'address', 'idScan', 'domicile', 'statements', 'investingExperience', 'isCompleted'])
            .where('profileId', '=', profileId)
            .limit(1)
            .executeTakeFirst();

        if (!data) {
            return null;
        }

        return Profile.create(data as unknown as ProfileSchema);
    }

    async findOrCreateProfile(profileId: string): Promise<Profile> {
        const profile = await this.findProfile(profileId);

        return profile ?? await this.createProfile(profileId);
    }

    async storeProfile(profile: Profile): Promise<void> {
        const rawProfile = this.prepareProfileForStoring(profile);

        await this.databaseAdapterProvider.provide()
            .insertInto(legalEntitiesProfileTable)
            .values({...rawProfile})
            .onConflict((oc) => oc
                .column('profileId')
                .doUpdateSet({...rawProfile})
            )
            .execute()
        ;
    }

    private prepareProfileForStoring(profile: Profile): LegalEntitiesProfile {
        const profileOutput = profile.toObject();
        const rawProfile = {} as LegalEntitiesProfile;
        for (const key of Object.keys(profileOutput)) {
            const value = profileOutput[key as keyof ProfileSchema];
            if (!LegalEntitiesJsonFields.includes(key)) {
                // @ts-ignore
                rawProfile[key] = value;
                continue;
            }

            if (value === null) {
                // @ts-ignore
                rawProfile[key] = null;
                continue;
            }

            // @ts-ignore
            rawProfile[key] = JSON.stringify(value);
        }

        return rawProfile;
    }

    async isSSNUnique(ssn: SSN, profileId: string): Promise<boolean> {
        const isProfileWithTheSSNExist = await this.databaseAdapterProvider.provide()
            .selectFrom(legalEntitiesProfileTable)
            .select(['profileId'])
            .where('ssn', '=', ssn.toObject())
            .where('profileId', '!=', profileId)
            .limit(1)
            .executeTakeFirst();

        return !isProfileWithTheSSNExist;
    }
}
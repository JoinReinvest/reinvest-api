import {LegalEntitiesDatabaseAdapterProvider} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {Profile} from "LegalEntities/Domain/Profile";
import {IdGeneratorInterface} from "IdGenerator/IdGenerator";

export class ProfileRepository {
    public static getClassName = (): string => "ProfileRepository";
    private databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider;
    private idGenerator: IdGeneratorInterface;

    constructor(databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider, uniqueGenerator: IdGeneratorInterface) {
        this.databaseAdapterProvider = databaseAdapterProvider;
        this.idGenerator = uniqueGenerator;
    }

    async findOrCreateProfile(profileId: string): Promise<Profile> {
        const externalId = this.idGenerator.createNumericId(9);
        const profile = new Profile(profileId, externalId, 'Account Holder');
        await this.storeProfile(profile);
        return profile;
    }

    async storeProfile(profile: Profile) {
        const profileOutput = profile.toObject();
        console.log({profileOutput});

    }
}
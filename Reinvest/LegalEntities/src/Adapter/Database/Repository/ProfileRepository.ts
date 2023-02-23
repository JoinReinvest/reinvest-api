import {LegalEntitiesDatabaseAdapterProvider} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {Profile} from "LegalEntities/Domain/Profile";

export class ProfileRepository {
    public static getClassName = (): string => "ProfileRepository";
    private databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider;

    constructor(databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider) {
        this.databaseAdapterProvider = databaseAdapterProvider;
    }

    async findOrCreateProfile(profileId: string): Promise<Profile> {
        return new Profile();
    }

    async storeProfile(profile: Profile) {

    }
}
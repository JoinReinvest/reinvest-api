import {LegalEntities} from "LegalEntities/index";
import {ProfileForSynchronization} from "Registration/Domain/Model/Profile";

/**
 * Legal Entities Module ACL
 */
export class LegalEntitiesService {
    public static getClassName = () => "LegalEntitiesService";
    private legalEntitiesModule: LegalEntities.Main;

    constructor(legalEntitiesModule: LegalEntities.Main) {
        this.legalEntitiesModule = legalEntitiesModule;
    }

    async getProfile(profileId: string): Promise<ProfileForSynchronization | null> {
        const api = this.legalEntitiesModule.api();

        return await api.getProfileForSynchronization(profileId) as ProfileForSynchronization | null
    }
}
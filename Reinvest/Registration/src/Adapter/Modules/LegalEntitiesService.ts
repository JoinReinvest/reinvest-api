import {ProfileForSynchronization} from "Registration/Common/Model/SharedTypes";
import {LegalEntities} from "LegalEntities/index";


/**
 * Legal Entities Module ACL
 */
export class LegalEntitiesService {
    public static getClassName = () => "LegalEntitiesService";
    private legalEntitiesModule: LegalEntities.Main;

    constructor(legalEntitiesModule: LegalEntities.Main) {
        this.legalEntitiesModule = legalEntitiesModule;
    }

    async getProfile(profileId: string): Promise<ProfileForSynchronization> {
        const api = this.legalEntitiesModule.api();

        return await api.getProfileForSynchronization(profileId) as ProfileForSynchronization;
    }
}
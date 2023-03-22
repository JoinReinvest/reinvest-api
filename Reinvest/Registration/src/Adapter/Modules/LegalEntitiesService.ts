import {LegalEntities} from "LegalEntities/index";
import {ProfileForSynchronization} from "Registration/Domain/Model/Profile";
import {IndividualAccountForSynchronization} from "Registration/Domain/Model/Account";

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

    async getIndividualAccount(profileId: string, accountId: string) {
        const api = this.legalEntitiesModule.api();

        return await api.getIndividualAccountForSynchronization(profileId, accountId) as IndividualAccountForSynchronization | null
    }
}
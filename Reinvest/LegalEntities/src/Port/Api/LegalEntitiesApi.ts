import {ContainerInterface} from "Container/Container";
import {ProfileController} from "LegalEntities/Port/Api/ProfileController";

export type LegalEntitiesApiType = {
    completeProfile: ProfileController["completeProfile"],
}

export const LegalEntitiesApi = (container: ContainerInterface): LegalEntitiesApiType => ({
    completeProfile: container.delegateTo(ProfileController, 'completeProfile'),
})

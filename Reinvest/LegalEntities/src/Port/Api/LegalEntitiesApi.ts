import {ContainerInterface} from "Container/Container";
import {ProfileController} from "LegalEntities/Port/Api/ProfileController";
import {DraftAccountsController} from "LegalEntities/Port/Api/DraftAccountsController";

export type LegalEntitiesApiType = {
    completeProfile: ProfileController["completeProfile"],
    createDraftAccount: DraftAccountsController["createDraftAccount"],
    completeIndividualDraftAccount: DraftAccountsController["completeIndividualDraftAccount"],
}

export const LegalEntitiesApi = (container: ContainerInterface): LegalEntitiesApiType => ({
    completeProfile: container.delegateTo(ProfileController, 'completeProfile'),
    createDraftAccount: container.delegateTo(DraftAccountsController, 'createDraftAccount'),
    completeIndividualDraftAccount: container.delegateTo(DraftAccountsController, 'completeIndividualDraftAccount'),
})

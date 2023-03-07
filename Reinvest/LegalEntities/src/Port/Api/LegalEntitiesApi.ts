import {ContainerInterface} from "Container/Container";
import {CompleteProfileController} from "LegalEntities/Port/Api/CompleteProfileController";
import {DraftAccountsController} from "LegalEntities/Port/Api/DraftAccountsController";
import {GetProfileController} from "LegalEntities/Port/Api/GetProfileController";

export type LegalEntitiesApiType = {
    getProfile: GetProfileController["getProfile"],
    completeProfile: CompleteProfileController["completeProfile"],
    createDraftAccount: DraftAccountsController["createDraftAccount"],
    completeIndividualDraftAccount: DraftAccountsController["completeIndividualDraftAccount"],
};

export const LegalEntitiesApi = (container: ContainerInterface): LegalEntitiesApiType => ({
    getProfile: container.delegateTo(GetProfileController, 'getProfile'),
    completeProfile: container.delegateTo(CompleteProfileController, 'completeProfile'),
    createDraftAccount: container.delegateTo(DraftAccountsController, 'createDraftAccount'),
    completeIndividualDraftAccount: container.delegateTo(DraftAccountsController, 'completeIndividualDraftAccount'),
});

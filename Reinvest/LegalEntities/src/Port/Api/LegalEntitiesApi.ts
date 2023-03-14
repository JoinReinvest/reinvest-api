import {ContainerInterface} from "Container/Container";
import {CompleteProfileController} from "LegalEntities/Port/Api/CompleteProfileController";
import {DraftAccountsController} from "LegalEntities/Port/Api/DraftAccountsController";
import {GetProfileController} from "LegalEntities/Port/Api/GetProfileController";

export type LegalEntitiesApiType = {
    getProfile: GetProfileController["getProfile"],
    completeProfile: CompleteProfileController["completeProfile"],
    createDraftAccount: DraftAccountsController["createDraftAccount"],
    completeIndividualDraftAccount: DraftAccountsController["completeIndividualDraftAccount"],
    readDraft: DraftAccountsController["readDraft"],
    listDrafts: DraftAccountsController["listDrafts"],
    removeDraft: DraftAccountsController["removeDraft"],
    transformDraftAccountIntoRegularAccount: DraftAccountsController["transformDraftAccountIntoRegularAccount"],
};

export const LegalEntitiesApi = (container: ContainerInterface): LegalEntitiesApiType => ({
    getProfile: container.delegateTo(GetProfileController, 'getProfile'),
    listDrafts: container.delegateTo(DraftAccountsController, 'listDrafts'),
    completeProfile: container.delegateTo(CompleteProfileController, 'completeProfile'),
    createDraftAccount: container.delegateTo(DraftAccountsController, 'createDraftAccount'),
    readDraft: container.delegateTo(DraftAccountsController, 'readDraft'),
    removeDraft: container.delegateTo(DraftAccountsController, 'removeDraft'),
    completeIndividualDraftAccount: container.delegateTo(DraftAccountsController, 'completeIndividualDraftAccount'),
    transformDraftAccountIntoRegularAccount: container.delegateTo(DraftAccountsController, 'transformDraftAccountIntoRegularAccount'),
});

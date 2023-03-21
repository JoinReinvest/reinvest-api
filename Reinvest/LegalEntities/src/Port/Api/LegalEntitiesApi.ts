import {ContainerInterface} from "Container/Container";
import {CompleteProfileController} from "LegalEntities/Port/Api/CompleteProfileController";
import {DraftAccountsController} from "LegalEntities/Port/Api/DraftAccountsController";
import {GetProfileController} from "LegalEntities/Port/Api/GetProfileController";
import {ReadAccountController} from "LegalEntities/Port/Api/ReadAccountController";

export type LegalEntitiesApiType = {
    getProfile: GetProfileController["getProfile"],
    getProfileForSynchronization: GetProfileController["getProfileForSynchronization"],
    completeProfile: CompleteProfileController["completeProfile"],

    createDraftAccount: DraftAccountsController["createDraftAccount"],
    completeIndividualDraftAccount: DraftAccountsController["completeIndividualDraftAccount"],
    readDraft: DraftAccountsController["readDraft"],
    listDrafts: DraftAccountsController["listDrafts"],
    removeDraft: DraftAccountsController["removeDraft"],
    transformDraftAccountIntoRegularAccount: DraftAccountsController["transformDraftAccountIntoRegularAccount"],

    getIndividualAccount: ReadAccountController["getIndividualAccount"],
    getAccountsOverview: ReadAccountController["getAccountsOverview"],
};

export const LegalEntitiesApi = (container: ContainerInterface): LegalEntitiesApiType => ({
    getProfile: container.delegateTo(GetProfileController, 'getProfile'),
    getProfileForSynchronization: container.delegateTo(GetProfileController, 'getProfileForSynchronization'),
    completeProfile: container.delegateTo(CompleteProfileController, 'completeProfile'),

    listDrafts: container.delegateTo(DraftAccountsController, 'listDrafts'),
    createDraftAccount: container.delegateTo(DraftAccountsController, 'createDraftAccount'),
    readDraft: container.delegateTo(DraftAccountsController, 'readDraft'),
    removeDraft: container.delegateTo(DraftAccountsController, 'removeDraft'),
    completeIndividualDraftAccount: container.delegateTo(DraftAccountsController, 'completeIndividualDraftAccount'),
    transformDraftAccountIntoRegularAccount: container.delegateTo(DraftAccountsController, 'transformDraftAccountIntoRegularAccount'),

    getIndividualAccount: container.delegateTo(ReadAccountController, 'getIndividualAccount'),
    getAccountsOverview: container.delegateTo(ReadAccountController, 'getAccountsOverview'),
});

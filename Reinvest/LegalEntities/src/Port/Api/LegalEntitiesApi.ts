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
    completeCompanyDraftAccount: DraftAccountsController["completeCompanyDraftAccount"],
    readDraft: DraftAccountsController["readDraft"],
    listDrafts: DraftAccountsController["listDrafts"],
    removeDraft: DraftAccountsController["removeDraft"],
    transformDraftAccountIntoRegularAccount: DraftAccountsController["transformDraftAccountIntoRegularAccount"],

    getIndividualAccount: ReadAccountController["getIndividualAccount"],
    getCompanyAccount: ReadAccountController["getCompanyAccount"],
    getIndividualAccountForSynchronization: ReadAccountController["getIndividualAccountForSynchronization"],
    getCompanyAccountForSynchronization: ReadAccountController["getCompanyAccountForSynchronization"],
    getCompanyForSynchronization: ReadAccountController["getCompanyForSynchronization"],
    getStakeholderForSynchronization: ReadAccountController["getStakeholderForSynchronization"],
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
    completeCompanyDraftAccount: container.delegateTo(DraftAccountsController, 'completeCompanyDraftAccount'),
    transformDraftAccountIntoRegularAccount: container.delegateTo(DraftAccountsController, 'transformDraftAccountIntoRegularAccount'),

    getIndividualAccount: container.delegateTo(ReadAccountController, 'getIndividualAccount'),
    getIndividualAccountForSynchronization: container.delegateTo(ReadAccountController, 'getIndividualAccountForSynchronization'),
    getCompanyAccountForSynchronization: container.delegateTo(ReadAccountController, 'getCompanyAccountForSynchronization'),
    getCompanyForSynchronization: container.delegateTo(ReadAccountController, 'getCompanyForSynchronization'),
    getStakeholderForSynchronization: container.delegateTo(ReadAccountController, 'getStakeholderForSynchronization'),

    getCompanyAccount: container.delegateTo(ReadAccountController, 'getCompanyAccount'),
    getAccountsOverview: container.delegateTo(ReadAccountController, 'getAccountsOverview'),
});

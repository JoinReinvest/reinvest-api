import { ContainerInterface } from 'Container/Container';
import { CompleteProfileController } from 'LegalEntities/Port/Api/CompleteProfileController';
import { DraftAccountsController } from 'LegalEntities/Port/Api/DraftAccountsController';
import { GetProfileController } from 'LegalEntities/Port/Api/GetProfileController';
import { ReadAccountController } from 'LegalEntities/Port/Api/ReadAccountController';

export type LegalEntitiesApiType = {
  completeCompanyDraftAccount: DraftAccountsController['completeCompanyDraftAccount'];
  completeIndividualDraftAccount: DraftAccountsController['completeIndividualDraftAccount'];
  completeProfile: CompleteProfileController['completeProfile'];

  createDraftAccount: DraftAccountsController['createDraftAccount'];
  getAccountsOverview: ReadAccountController['getAccountsOverview'];
  getCompanyAccount: ReadAccountController['getCompanyAccount'];
  getCompanyAccountForSynchronization: ReadAccountController['getCompanyAccountForSynchronization'];
  getCompanyForSynchronization: ReadAccountController['getCompanyForSynchronization'];
  getIndividualAccount: ReadAccountController['getIndividualAccount'];
  getIndividualAccountForSynchronization: ReadAccountController['getIndividualAccountForSynchronization'];

  getProfile: GetProfileController['getProfile'];
  getProfileForSynchronization: GetProfileController['getProfileForSynchronization'];
  getStakeholderForSynchronization: ReadAccountController['getStakeholderForSynchronization'];
  listDrafts: DraftAccountsController['listDrafts'];
  readDraft: DraftAccountsController['readDraft'];
  removeDraft: DraftAccountsController['removeDraft'];
  transformDraftAccountIntoRegularAccount: DraftAccountsController['transformDraftAccountIntoRegularAccount'];
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

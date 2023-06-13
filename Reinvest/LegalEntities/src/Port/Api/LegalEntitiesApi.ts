import { ContainerInterface } from 'Container/Container';
import { BeneficiaryAccountController } from 'LegalEntities/Port/Api/BeneficiaryAccountController';
import { CompleteProfileController } from 'LegalEntities/Port/Api/CompleteProfileController';
import { DraftAccountsController } from 'LegalEntities/Port/Api/DraftAccountsController';
import { GetProfileController } from 'LegalEntities/Port/Api/GetProfileController';
import { ReadAccountController } from 'LegalEntities/Port/Api/ReadAccountController';
import { UpdateProfileController } from 'LegalEntities/Port/Api/UpdateProfileController';
import { UpdateForVerificationController } from 'Reinvest/LegalEntities/src/Port/Api/UpdateForVerificationController';

export type LegalEntitiesApiType = {
  completeCompanyDraftAccount: DraftAccountsController['completeCompanyDraftAccount'];
  completeIndividualDraftAccount: DraftAccountsController['completeIndividualDraftAccount'];
  completeProfile: CompleteProfileController['completeProfile'];

  createDraftAccount: DraftAccountsController['createDraftAccount'];
  getAccountsOverview: ReadAccountController['getAccountsOverview'];
  getBeneficiaryAccountForSynchronization: ReadAccountController['getBeneficiaryAccountForSynchronization'];
  getCompanyAccount: ReadAccountController['getCompanyAccount'];
  getCompanyAccountForSynchronization: ReadAccountController['getCompanyAccountForSynchronization'];
  getCompanyForSynchronization: ReadAccountController['getCompanyForSynchronization'];
  getIndividualAccount: ReadAccountController['getIndividualAccount'];
  getIndividualAccountForSynchronization: ReadAccountController['getIndividualAccountForSynchronization'];

  getProfile: GetProfileController['getProfile'];
  getProfileForSynchronization: GetProfileController['getProfileForSynchronization'];
  getStakeholderForSynchronization: ReadAccountController['getStakeholderForSynchronization'];
  listDrafts: DraftAccountsController['listDrafts'];
  mapAccountIdToParentAccountIdIfRequired: ReadAccountController['mapAccountIdToParentAccountIdIfRequired'];
  openBeneficiaryAccount: BeneficiaryAccountController['openBeneficiaryAccount'];
  readBeneficiaryAccount: ReadAccountController['readBeneficiaryAccount'];
  readDraft: DraftAccountsController['readDraft'];
  removeDraft: DraftAccountsController['removeDraft'];
  transformDraftAccountIntoRegularAccount: DraftAccountsController['transformDraftAccountIntoRegularAccount'];

  updateCompanyForVerification: UpdateForVerificationController['updateCompanyForVerification'];
  updateProfile: UpdateProfileController['updateProfile'];
  updateProfileForVerification: UpdateForVerificationController['updateProfileForVerification'];

  updateStakeholderForVerification: UpdateForVerificationController['updateStakeholderForVerification'];
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
  mapAccountIdToParentAccountIdIfRequired: container.delegateTo(ReadAccountController, 'mapAccountIdToParentAccountIdIfRequired'),
  getIndividualAccount: container.delegateTo(ReadAccountController, 'getIndividualAccount'),
  getIndividualAccountForSynchronization: container.delegateTo(ReadAccountController, 'getIndividualAccountForSynchronization'),
  getCompanyAccountForSynchronization: container.delegateTo(ReadAccountController, 'getCompanyAccountForSynchronization'),
  getCompanyForSynchronization: container.delegateTo(ReadAccountController, 'getCompanyForSynchronization'),
  getStakeholderForSynchronization: container.delegateTo(ReadAccountController, 'getStakeholderForSynchronization'),
  getBeneficiaryAccountForSynchronization: container.delegateTo(ReadAccountController, 'getBeneficiaryAccountForSynchronization'),
  getCompanyAccount: container.delegateTo(ReadAccountController, 'getCompanyAccount'),
  getAccountsOverview: container.delegateTo(ReadAccountController, 'getAccountsOverview'),
  openBeneficiaryAccount: container.delegateTo(BeneficiaryAccountController, 'openBeneficiaryAccount'),
  readBeneficiaryAccount: container.delegateTo(ReadAccountController, 'readBeneficiaryAccount'),

  updateCompanyForVerification: container.delegateTo(UpdateForVerificationController, 'updateCompanyForVerification'),
  updateProfileForVerification: container.delegateTo(UpdateForVerificationController, 'updateProfileForVerification'),
  updateStakeholderForVerification: container.delegateTo(UpdateForVerificationController, 'updateStakeholderForVerification'),

  updateProfile: container.delegateTo(UpdateProfileController, 'updateProfile'),
});

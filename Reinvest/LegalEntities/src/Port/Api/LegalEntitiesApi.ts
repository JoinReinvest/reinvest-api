import { ContainerInterface } from 'Container/Container';
import { BanController } from 'LegalEntities/Port/Api/BanController';
import { BeneficiaryAccountController } from 'LegalEntities/Port/Api/BeneficiaryAccountController';
import { CompleteProfileController } from 'LegalEntities/Port/Api/CompleteProfileController';
import { DraftAccountsController } from 'LegalEntities/Port/Api/DraftAccountsController';
import { GetProfileController } from 'LegalEntities/Port/Api/GetProfileController';
import { ReadAccountController } from 'LegalEntities/Port/Api/ReadAccountController';
import { SubscriptionAgreementDataController } from 'LegalEntities/Port/Api/SubscriptionAgreementDataController';
import { UpdateProfileController } from 'LegalEntities/Port/Api/UpdateProfileController';
import { UpdateAccountsController } from 'Reinvest/LegalEntities/src/Port/Api/UpdateAccountsController';
import { UpdateForVerificationController } from 'Reinvest/LegalEntities/src/Port/Api/UpdateForVerificationController';

export type LegalEntitiesApiType = {
  archiveBeneficiary: BeneficiaryAccountController['archiveBeneficiary'];
  banAccount: BanController['banAccount'];
  banUser: BanController['banUser'];

  completeCompanyDraftAccount: DraftAccountsController['completeCompanyDraftAccount'];
  completeIndividualDraftAccount: DraftAccountsController['completeIndividualDraftAccount'];
  completeProfile: CompleteProfileController['completeProfile'];
  createDraftAccount: DraftAccountsController['createDraftAccount'];
  getAccountsOverview: ReadAccountController['getAccountsOverview'];
  getBeneficiaryAccountForSynchronization: ReadAccountController['getBeneficiaryAccountForSynchronization'];
  getCompanyAccount: ReadAccountController['getCompanyAccount'];
  getCompanyAccountForSynchronization: ReadAccountController['getCompanyAccountForSynchronization'];
  getCompanyForSynchronization: ReadAccountController['getCompanyForSynchronization'];
  getDataForWithdrawalAgreement: SubscriptionAgreementDataController['getDataForWithdrawalAgreement'];
  getIndividualAccount: ReadAccountController['getIndividualAccount'];
  getIndividualAccountForSynchronization: ReadAccountController['getIndividualAccountForSynchronization'];

  getInvestorDataForAgreements: SubscriptionAgreementDataController['getInvestorDataForAgreements'];
  getProfile: GetProfileController['getProfile'];
  getProfileAccountStructure: ReadAccountController['getProfileAccountStructure'];
  getProfileForSynchronization: GetProfileController['getProfileForSynchronization'];
  getProfileNames: GetProfileController['getProfileNames'];
  getStakeholderForSynchronization: ReadAccountController['getStakeholderForSynchronization'];
  listBanned: BanController['listBanned'];
  listDrafts: DraftAccountsController['listDrafts'];
  mapAccountIdToParentAccountIdIfRequired: ReadAccountController['mapAccountIdToParentAccountIdIfRequired'];
  openBeneficiaryAccount: BeneficiaryAccountController['openBeneficiaryAccount'];
  readBeneficiaryAccount: ReadAccountController['readBeneficiaryAccount'];

  readDraft: DraftAccountsController['readDraft'];
  removeDraft: DraftAccountsController['removeDraft'];
  transformDraftAccountIntoRegularAccount: DraftAccountsController['transformDraftAccountIntoRegularAccount'];
  unban: BanController['unban'];
  updateBeneficiaryAccount: UpdateAccountsController['updateBeneficiaryAccount'];

  updateCompanyForVerification: UpdateForVerificationController['updateCompanyForVerification'];
  updateCorporateAccount: UpdateAccountsController['updateCorporateAccount'];
  updateIndividualAccount: UpdateAccountsController['updateIndividualAccount'];
  updateProfile: UpdateProfileController['updateProfile'];
  updateProfileForVerification: UpdateForVerificationController['updateProfileForVerification'];
  updateStakeholderForVerification: UpdateForVerificationController['updateStakeholderForVerification'];
  updateTrustAccount: UpdateAccountsController['updateTrustAccount'];
};

export const LegalEntitiesApi = (container: ContainerInterface): LegalEntitiesApiType => ({
  getProfile: container.delegateTo(GetProfileController, 'getProfile'),
  getProfileForSynchronization: container.delegateTo(GetProfileController, 'getProfileForSynchronization'),
  completeProfile: container.delegateTo(CompleteProfileController, 'completeProfile'),
  getDataForWithdrawalAgreement: container.delegateTo(SubscriptionAgreementDataController, 'getDataForWithdrawalAgreement'),
  getProfileNames: container.delegateTo(GetProfileController, 'getProfileNames'),

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
  getProfileAccountStructure: container.delegateTo(ReadAccountController, 'getProfileAccountStructure'),
  archiveBeneficiary: container.delegateTo(BeneficiaryAccountController, 'archiveBeneficiary'),
  getInvestorDataForAgreements: container.delegateTo(SubscriptionAgreementDataController, 'getInvestorDataForAgreements'),

  updateCompanyForVerification: container.delegateTo(UpdateForVerificationController, 'updateCompanyForVerification'),
  updateProfileForVerification: container.delegateTo(UpdateForVerificationController, 'updateProfileForVerification'),
  updateStakeholderForVerification: container.delegateTo(UpdateForVerificationController, 'updateStakeholderForVerification'),

  updateProfile: container.delegateTo(UpdateProfileController, 'updateProfile'),
  updateIndividualAccount: container.delegateTo(UpdateAccountsController, 'updateIndividualAccount'),
  updateCorporateAccount: container.delegateTo(UpdateAccountsController, 'updateCorporateAccount'),
  updateTrustAccount: container.delegateTo(UpdateAccountsController, 'updateTrustAccount'),
  updateBeneficiaryAccount: container.delegateTo(UpdateAccountsController, 'updateBeneficiaryAccount'),
  listBanned: container.delegateTo(BanController, 'listBanned'),
  banUser: container.delegateTo(BanController, 'banUser'),
  unban: container.delegateTo(BanController, 'unban'),
  banAccount: container.delegateTo(BanController, 'banAccount'),
});

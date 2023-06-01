import { LegalEntities } from 'LegalEntities/index';
import {
  BeneficiaryAccountForSynchronization,
  CompanyAccountForSynchronization,
  CompanyForSynchronization,
  IndividualAccountForSynchronization,
  StakeholderForSynchronization,
} from 'Registration/Domain/Model/Account';
import { ProfileForSynchronization } from 'Registration/Domain/Model/Profile';

/**
 * Legal Entities Module ACL
 */
export class LegalEntitiesService {
  private legalEntitiesModule: LegalEntities.Main;

  constructor(legalEntitiesModule: LegalEntities.Main) {
    this.legalEntitiesModule = legalEntitiesModule;
  }

  public static getClassName = () => 'LegalEntitiesService';

  async getProfile(profileId: string): Promise<ProfileForSynchronization | never> {
    const api = this.legalEntitiesModule.api();

    const profile = (await api.getProfileForSynchronization(profileId)) as ProfileForSynchronization | null;

    if (profile === null) {
      throw new Error(`Profile not found, profileId: ${profileId}`);
    }

    return profile;
  }

  async getIndividualAccount(profileId: string, accountId: string): Promise<IndividualAccountForSynchronization | never> {
    const api = this.legalEntitiesModule.api();
    const individualAccount = (await api.getIndividualAccountForSynchronization(profileId, accountId)) as IndividualAccountForSynchronization | null;

    if (individualAccount === null) {
      throw new Error(`Individual account not found, profileId: ${profileId}, accountId: ${accountId}`);
    }

    return individualAccount;
  }

  async getCompanyAccount(profileId: string, accountId: string): Promise<CompanyAccountForSynchronization | never> {
    const api = this.legalEntitiesModule.api();
    const companyAccount = (await api.getCompanyAccountForSynchronization(profileId, accountId)) as CompanyAccountForSynchronization | null;

    if (companyAccount === null) {
      throw new Error(`Company account not found, profileId: ${profileId}, accountId: ${accountId}`);
    }

    return companyAccount;
  }

  async getCompany(profileId: string, accountId: string): Promise<CompanyForSynchronization | never> {
    const api = this.legalEntitiesModule.api();
    const company = (await api.getCompanyForSynchronization(profileId, accountId)) as CompanyForSynchronization | null;

    if (company === null) {
      throw new Error(`Company not found, profileId: ${profileId}, accountId: ${accountId}`);
    }

    return company;
  }

  async getStakeholder(profileId: string, accountId: string, stakeholderId: string): Promise<StakeholderForSynchronization | never> {
    const api = this.legalEntitiesModule.api();
    const stakeholder = (await api.getStakeholderForSynchronization(profileId, accountId, stakeholderId)) as StakeholderForSynchronization | null;

    if (stakeholder === null) {
      throw new Error(`Stakeholder not found, profileId: ${profileId}, accountId: ${accountId}, stakeholderId: ${stakeholderId}`);
    }

    return stakeholder;
  }

  async getBeneficiaryAccount(profileId: string, beneficiaryAccountId: string): Promise<BeneficiaryAccountForSynchronization | never> {
    const api = this.legalEntitiesModule.api();
    const beneficiaryAccount = (await api.getBeneficiaryAccountForSynchronization(
      profileId,
      beneficiaryAccountId,
    )) as BeneficiaryAccountForSynchronization | null;

    if (beneficiaryAccount === null) {
      throw new Error(`Beneficiary account not found, profileId: ${profileId}, accountId: ${beneficiaryAccountId}`);
    }

    return beneficiaryAccount;
  }
}

import {
  CompanyAccountForSynchronization,
  CompanyForSynchronization,
  IndividualAccountForSynchronization,
  StakeholderForSynchronization,
} from 'Registration/Domain/Model/Account';
import { ProfileForSynchronization } from 'Registration/Domain/Model/Profile';
import { CompanyType, DomicileType, EmploymentStatusType } from 'Registration/Domain/Model/ReinvestTypes';
import { MainParty } from 'Registration/Domain/VendorModel/NorthCapital/MainParty';
import { NorthCapitalCompanyAccount } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalCompanyAccount';
import { NorthCapitalCompanyEntity } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalCompanyEntity';
import { NorthCapitalIndividualAccount } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalIndividualAccount';
import { NorthCapitalStakeholderParty } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalStakeholderParty';
import { NorthCapitalDomicile, NorthCapitalEmploymentStatus, NorthCapitalEntityType } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes';

export class NorthCapitalMapper {
  static mapProfile(profile: ProfileForSynchronization, email: string): MainParty {
    return MainParty.createFromProfileForSynchronization(profile, email);
  }

  static mapIndividualAccount(individualAccount: IndividualAccountForSynchronization): NorthCapitalIndividualAccount {
    return NorthCapitalIndividualAccount.createFromIndividualAccountForSynchronization(individualAccount);
  }

  static mapCompanyAccount(companyAccount: CompanyAccountForSynchronization): NorthCapitalCompanyAccount {
    return NorthCapitalCompanyAccount.createFromCompanyAccountForSynchronization(companyAccount);
  }

  static mapCompany(company: CompanyForSynchronization, email: string): NorthCapitalCompanyEntity {
    return NorthCapitalCompanyEntity.createFromCompanyForSynchronization(company, email);
  }

  static mapStakeholder(stakeholder: StakeholderForSynchronization, email: string): NorthCapitalStakeholderParty {
    return NorthCapitalStakeholderParty.createFromStakeholderForSynchronization(stakeholder, email);
  }

  static mapDomicile(domicile: DomicileType): NorthCapitalDomicile | null {
    switch (domicile) {
      case DomicileType.CITIZEN:
        return NorthCapitalDomicile.CITIZEN;
      case DomicileType.GREEN_CARD:
      case DomicileType.VISA:
      case DomicileType.RESIDENT:
        return NorthCapitalDomicile.RESIDENT;
      default:
        return null;
    }
  }

  static mapCompanyType(companyType: CompanyType): NorthCapitalEntityType | null {
    switch (companyType) {
      case CompanyType.CORPORATION:
        return NorthCapitalEntityType.CORPORATION;
      case CompanyType.LLC:
        return NorthCapitalEntityType.LLC;
      case CompanyType.PARTNERSHIP:
        return NorthCapitalEntityType.PARTNERSHIP;
      case CompanyType.IRREVOCABLE:
        return NorthCapitalEntityType.IRREVOCABLE;
      case CompanyType.REVOCABLE:
        return NorthCapitalEntityType.REVOCABLE;
      default:
        return null;
    }
  }

  static mapEmploymentStatus(employmentStatus?: EmploymentStatusType): NorthCapitalEmploymentStatus | null {
    switch (employmentStatus) {
      case EmploymentStatusType.EMPLOYED:
        return NorthCapitalEmploymentStatus.EMPLOYED;
      case EmploymentStatusType.RETIRED:
        return NorthCapitalEmploymentStatus.RETIRED;
      case EmploymentStatusType.STUDENT:
        return NorthCapitalEmploymentStatus.STUDENT;
      case EmploymentStatusType.UNEMPLOYED:
        return NorthCapitalEmploymentStatus.UNEMPLOYED;
      default:
        return null;
    }
  }
}

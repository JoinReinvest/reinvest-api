import {ProfileForSynchronization} from "Registration/Domain/Model/Profile";
import {MainParty} from "Registration/Domain/VendorModel/NorthCapital/MainParty";
import {CompanyAccountForSynchronization, IndividualAccountForSynchronization} from "Registration/Domain/Model/Account";
import {
    NorthCapitalIndividualAccount
} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalIndividualAccount";
import {
    NorthCapitalDomicile,
    NorthCapitalEmploymentStatus, NorthCapitalEntityType
} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes";
import {CompanyType, DomicileType, EmploymentStatusType} from "Registration/Domain/Model/ReinvestTypes";
import {NorthCapitalCompanyAccount} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalCompanyAccount";

export class NorthCapitalMapper {
    static mapProfile(profile: ProfileForSynchronization, email: string): MainParty {
        return MainParty.createFromProfileForSynchronization(profile, email);
    }

    static mapIndividualAccount(individualAccount: IndividualAccountForSynchronization) {
        return NorthCapitalIndividualAccount.createFromIndividualAccountForSynchronization(individualAccount);
    }

    static mapCompanyAccount(companyAccount: CompanyAccountForSynchronization) {
        return NorthCapitalCompanyAccount.createFromCompanyAccountForSynchronization(companyAccount);
    }

    static mapDomicile(domicile: DomicileType): NorthCapitalDomicile | null {
        switch (domicile) {
            case DomicileType.CITIZEN:
                return NorthCapitalDomicile.CITIZEN;
            case DomicileType.GREEN_CARD:
            case DomicileType.VISA:
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
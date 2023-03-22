import {ProfileForSynchronization} from "Registration/Domain/Model/Profile";
import {MainParty} from "Registration/Domain/VendorModel/NorthCapital/MainParty";
import {IndividualAccountForSynchronization} from "Registration/Domain/Model/Account";
import {IndividualAccount} from "Registration/Domain/VendorModel/NorthCapital/IndividualAccount";
import {
    NorthCapitalDomicile,
    NorthCapitalEmploymentStatus
} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes";
import {DomicileType, EmploymentStatusType} from "Registration/Domain/Model/ReinvestTypes";

export class NorthCapitalMapper {
    static mapProfile(profile: ProfileForSynchronization, email: string): MainParty {
        return MainParty.createFromProfileForSynchronization(profile, email);
    }

    static mapIndividualAccount(individualAccount: IndividualAccountForSynchronization) {
        return IndividualAccount.createFromIndividualAccountForSynchronization(individualAccount);
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
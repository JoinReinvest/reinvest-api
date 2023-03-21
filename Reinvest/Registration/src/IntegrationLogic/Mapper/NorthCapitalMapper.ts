import {ProfileForSynchronization} from "Registration/Domain/Model/Profile";
import {MainParty} from "Registration/Domain/VendorModel/NorthCapital/MainParty";

export class NorthCapitalMapper {
    static mapProfile(profile: ProfileForSynchronization, email: string): MainParty {
        return MainParty.createFromProfileForSynchronization(profile, email);
    }
}
import {IndividualAccountForSynchronization} from "Registration/Domain/Model/Account";
import {VertaloIndividualAccount} from "Registration/Domain/VendorModel/Vertalo/VertaloIndividualAccount";


export class VertaloMapper {
    static mapIndividualAccount(individualAccount: IndividualAccountForSynchronization, email: string): VertaloIndividualAccount {
        return VertaloIndividualAccount.createFromIndividualAccountForSynchronization(individualAccount, email);
    }
}
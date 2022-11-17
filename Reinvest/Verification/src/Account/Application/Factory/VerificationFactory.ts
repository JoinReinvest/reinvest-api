import {AccountMember} from "../../Domain/ValueObject/AccountMember";
import {PersonVerification} from "../../../Person/Domain/PersonVerification";
import {CompanyVerification} from "../../../Company/Domain/CompanyVerification";

export class VerificationFactory {
    public static createFromAccountMember(member: AccountMember): PersonVerification | CompanyVerification {
        return new PersonVerification();
    }
}
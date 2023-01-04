import { CompanyVerification } from "../../../Company/Domain/CompanyVerification";
import { PersonVerification } from "../../../Person/Domain/PersonVerification";
import { AccountMember } from "../../Domain/ValueObject/AccountMember";

export class VerificationFactory {
  public static createFromAccountMember(
    member: AccountMember
  ): PersonVerification | CompanyVerification {
    return new PersonVerification();
  }
}

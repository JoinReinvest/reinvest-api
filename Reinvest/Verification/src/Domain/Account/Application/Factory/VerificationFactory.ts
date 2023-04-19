import { AccountMember } from 'Reinvest/Verification/src/Domain/Account/Domain/ValueObject/AccountMember';

import { CompanyVerification } from '../../../Company/Domain/CompanyVerification';
import { PersonVerification } from '../../../Person/Domain/PersonVerification';

export class VerificationFactory {
  public static createFromAccountMember(member: AccountMember): PersonVerification | CompanyVerification {
    return new PersonVerification();
  }
}

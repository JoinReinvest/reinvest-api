import { InvestingAccountId } from 'Reinvest/Verification/src/Domain/Account/Domain/ValueObject/InvestingAccountId';
import { Id } from 'Verification/Domain/ValueObject/Id';

export class AccountVerification {
  private membersId: Id[];
  private accountId: InvestingAccountId;

  constructor(accountId: InvestingAccountId, membersId: Id[]) {
    this.accountId = accountId;
    this.membersId = membersId;
  }

  isApproved(): boolean {
    return false;
  }

  isWaitingForManualVerification(): boolean {
    return false;
  }
}

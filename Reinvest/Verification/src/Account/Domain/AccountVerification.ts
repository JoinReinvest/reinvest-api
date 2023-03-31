import { Id } from '../../Common/Domain/ValueObject/Id';
import { InvestingAccountId } from './ValueObject/InvestingAccountId';

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

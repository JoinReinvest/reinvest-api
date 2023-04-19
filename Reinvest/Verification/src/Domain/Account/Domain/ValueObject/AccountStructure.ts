import { AccountMember } from 'Reinvest/Verification/src/Domain/Account/Domain/ValueObject/AccountMember';
import { Id } from 'Verification/Domain/ValueObject/Id';

export class AccountStructure {
  getMembersId(): Id[] {
    return [new Id('mock')];
  }

  *getMembers(): Generator<AccountMember> {
    yield new AccountMember();
  }
}

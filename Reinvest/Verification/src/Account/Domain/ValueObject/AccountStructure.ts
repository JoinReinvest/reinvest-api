import { Id } from '../../../Common/Domain/ValueObject/Id';
import { AccountMember } from './AccountMember';

export class AccountStructure {
  getMembersId(): Id[] {
    return [new Id('mock')];
  }

  *getMembers(): Generator<AccountMember> {
    yield new AccountMember();
  }
}

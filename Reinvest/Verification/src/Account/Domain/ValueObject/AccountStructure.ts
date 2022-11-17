import {AccountMember} from "./AccountMember";
import {Id} from "../../../Common/Domain/ValueObject/Id";

export class AccountStructure {
    getMembersId(): Id[] {
        return [new Id('mock')];
    }

    * getMembers(): Generator<AccountMember> {
        yield new AccountMember();
    }
}

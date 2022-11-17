import {InvestingAccountId} from "./ValueObject/InvestingAccountId";
import {Id} from "../../Common/Domain/ValueObject/Id";

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
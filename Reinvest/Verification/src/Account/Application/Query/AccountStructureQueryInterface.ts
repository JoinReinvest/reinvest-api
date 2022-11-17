import {AccountStructure} from "../../Domain/ValueObject/AccountStructure";
import {InvestingAccountId} from "../../Domain/ValueObject/InvestingAccountId";

export interface AccountStructureQueryInterface {
    getAccountStructure(accountId: InvestingAccountId): AccountStructure;
}


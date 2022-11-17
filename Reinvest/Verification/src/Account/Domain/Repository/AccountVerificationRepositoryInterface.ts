import {AccountVerification} from "../AccountVerification";
import {InvestingAccountId} from "../ValueObject/InvestingAccountId";

export interface AccountVerificationRepositoryInterface {

    save(accountVerification: AccountVerification): void;

    get(accountId: InvestingAccountId): AccountVerification;
}
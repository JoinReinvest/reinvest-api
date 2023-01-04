import { AccountVerification } from "../AccountVerification";
import { InvestingAccountId } from "../ValueObject/InvestingAccountId";

export interface AccountVerificationRepositoryInterface {
  get(accountId: InvestingAccountId): AccountVerification;

  save(accountVerification: AccountVerification): void;
}

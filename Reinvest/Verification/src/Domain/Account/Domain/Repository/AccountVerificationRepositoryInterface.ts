import { AccountVerification } from 'Reinvest/Verification/src/Domain/Account/Domain/AccountVerification';
import { InvestingAccountId } from 'Reinvest/Verification/src/Domain/Account/Domain/ValueObject/InvestingAccountId';

export interface AccountVerificationRepositoryInterface {
  get(accountId: InvestingAccountId): AccountVerification;

  save(accountVerification: AccountVerification): void;
}

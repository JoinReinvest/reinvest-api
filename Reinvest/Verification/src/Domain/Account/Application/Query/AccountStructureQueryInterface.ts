import { AccountStructure } from 'Reinvest/Verification/src/Domain/Account/Domain/ValueObject/AccountStructure';
import { InvestingAccountId } from 'Reinvest/Verification/src/Domain/Account/Domain/ValueObject/InvestingAccountId';

export interface AccountStructureQueryInterface {
  getAccountStructure(accountId: InvestingAccountId): AccountStructure;
}

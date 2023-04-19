import { CompanyAccountForSynchronization, IndividualAccountForSynchronization } from 'Registration/Domain/Model/Account';
import { VertaloAccount } from 'Registration/Domain/VendorModel/Vertalo/VertaloAccount';

export class VertaloMapper {
  static mapIndividualAccount(individualAccount: IndividualAccountForSynchronization, email: string): VertaloAccount {
    return VertaloAccount.createAccount(individualAccount.name, email);
  }

  static mapCompanyAccount(companyAccount: CompanyAccountForSynchronization, email: string): VertaloAccount {
    return VertaloAccount.createAccount(companyAccount.ownerName, email);
  }
}

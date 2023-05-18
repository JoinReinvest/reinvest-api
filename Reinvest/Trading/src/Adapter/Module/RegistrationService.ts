import { VendorIdsConfiguration } from 'Trading/Domain/Trade';

export class RegistrationService {
  static getClassName = () => 'RegistrationService';

  async mapInternalIdsToVendorIds(portfolioId: string, bankAccountId: string, accountId: string): Promise<VendorIdsConfiguration> {
    // TODO: get mapping configuration from the registration module
    return {
      offeringId: '1290029',
      allocationId: '6a03167e-28d1-4378-b881-a5ade307b81b',
      bankAccountName: 'Plaid Checking - Wells Fargo',
      northCapitalAccountId: 'A1234',
    };
  }
}

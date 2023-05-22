import { VendorsConfiguration } from 'Trading/Domain/Trade';

export class RegistrationService {
  static getClassName = () => 'RegistrationService';

  async getVendorsConfiguration(portfolioId: string, bankAccountId: string, accountId: string): Promise<VendorsConfiguration> {
    // TODO: get mapping configuration from the registration module
    return {
      offeringId: '1290029',
      allocationId: '6a03167e-28d1-4378-b881-a5ade307b81b',
      bankAccountName: 'Plaid Checking - Wells Fargo',
      northCapitalAccountId: 'A2097990',
      unitSharePrice: 104,
      accountEmail: 'individual_account-711cad4f-e01e-4317-8395-a550c0ca137f-4db7efd5-dc4a-47d1-9b8b-0e94e182c8e1@devkick.pl',
    };
  }
}

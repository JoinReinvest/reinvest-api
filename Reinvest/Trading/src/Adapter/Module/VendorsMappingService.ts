import { Portfolio } from 'Portfolio/index';
import { Registration } from 'Registration/index';
import { VendorsConfiguration } from 'Trading/Domain/Trade';

export class VendorsMappingService {
  private registrationModule: Registration.Main;
  private portfolio: Portfolio.Main;

  constructor(registrationModule: Registration.Main, portfolio: Portfolio.Main) {
    this.registrationModule = registrationModule;
    this.portfolio = portfolio;
  }

  static getClassName = () => 'VendorsMappingService';

  async getVendorsConfiguration(portfolioId: string, bankAccountId: string, accountId: string): Promise<VendorsConfiguration> {
    const { offeringId, allocationId, unitSharePrice } = await this.getPortfolioMapping(portfolioId);
    const { accountEmail, northCapitalAccountId } = await this.getAccountMapping(accountId);
    const { bankAccountName } = await this.getBankAccountMapping(bankAccountId);

    return {
      offeringId,
      allocationId,
      bankAccountName,
      northCapitalAccountId,
      unitSharePrice,
      accountEmail,
    };
  }

  private async getPortfolioMapping(portfolioId: string) {
    const { ncOfferingId, vertaloAllocationId } = await this.portfolio.api().getPortfolioVendorsConfiguration(portfolioId);
    const { unitSharePrice } = await this.portfolio.api().getCurrentNav(portfolioId);

    return {
      offeringId: ncOfferingId,
      allocationId: vertaloAllocationId,
      unitSharePrice: unitSharePrice,
    };
  }

  private async getAccountMapping(accountId: string) {
    const data = await this.registrationModule.api().getAccountMapping(accountId);

    if (!data) {
      throw new Error(`[Trading/VendorsMapping] Account mapping not found for account ${accountId}`);
    }

    const { northCapitalAccountId, accountEmail } = data;

    return {
      northCapitalAccountId,
      accountEmail,
    };
  }

  private async getBankAccountMapping(bankAccountId: string) {
    const data = await this.registrationModule.api().getBankAccountMapping(bankAccountId);

    if (!data || !data?.bankAccountNickName) {
      throw new Error(`[Trading/VendorsMapping] Bank account mapping not found for bank account ${bankAccountId}`);
    }

    return {
      bankAccountName: data!.bankAccountNickName,
    };
  }
}

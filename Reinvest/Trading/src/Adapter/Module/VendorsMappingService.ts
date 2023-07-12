import { Portfolio } from 'Portfolio/index';
import { Registration } from 'Registration/index';
import { ReinvestmentVendorsConfiguration } from 'Trading/Domain/ReinvestmentTrade';
import { VendorsConfiguration } from 'Trading/Domain/Trade';

export class VendorsMappingService {
  private registrationModule: Registration.Main;
  private portfolio: Portfolio.Main;

  constructor(registrationModule: Registration.Main, portfolio: Portfolio.Main) {
    this.registrationModule = registrationModule;
    this.portfolio = portfolio;
  }

  static getClassName = () => 'VendorsMappingService';

  async getVendorsConfiguration(portfolioId: string, bankAccountId: string, accountId: string, parentId: string): Promise<VendorsConfiguration> {
    const { offeringId, allocationId, unitSharePrice } = await this.getPortfolioMapping(portfolioId);
    const { accountEmail, northCapitalAccountId } = await this.getAccountMapping(accountId);
    let parentEmail = accountEmail;
    let northCapitalParentAccountId = northCapitalAccountId as string;

    if (accountId !== parentId) {
      const parentMapping = await this.getAccountMapping(parentId);
      parentEmail = parentMapping.accountEmail;
      northCapitalParentAccountId = parentMapping.northCapitalAccountId as string;
    }

    const { bankAccountName } = await this.getBankAccountMapping(bankAccountId);

    return {
      offeringId,
      allocationId,
      bankAccountName,
      northCapitalAccountId,
      unitSharePrice,
      accountEmail,
      parentEmail,
      northCapitalParentAccountId,
    };
  }

  async getAbsoluteCurrentNav(portfolioId: string): Promise<number> {
    const { unitSharePrice } = await this.portfolio.api().getAbsoluteCurrentNav(portfolioId);

    return unitSharePrice;
  }

  async getReinvestmentVendorsConfiguration(portfolioId: string, accountId: string): Promise<ReinvestmentVendorsConfiguration> {
    const { allocationId, unitSharePrice } = await this.getPortfolioMapping(portfolioId);
    const { accountEmail } = await this.getAccountMapping(accountId);

    return {
      allocationId,
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

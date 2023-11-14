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
    const { offeringId, allocationId } = await this.getPortfolioMapping(portfolioId);
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
      accountEmail,
      parentEmail,
      northCapitalParentAccountId,
    };
  }

  async getAbsoluteCurrentNav(portfolioId: string): Promise<number> {
    await this.portfolio.api().synchronizePortfolioUnitPrice(portfolioId);
    const {
      unitPrice: { value },
    } = await this.portfolio.api().getCurrentUnitPrice(portfolioId);

    return value;
  }

  async getReinvestmentVendorsConfiguration(portfolioId: string, accountId: string): Promise<ReinvestmentVendorsConfiguration> {
    const { allocationId } = await this.getPortfolioMapping(portfolioId);
    const {
      unitPrice: { value },
    } = await this.portfolio.api().getCurrentUnitPrice(portfolioId);
    const { accountEmail } = await this.getAccountMapping(accountId);

    return {
      allocationId,
      unitSharePrice: value,
      accountEmail,
    };
  }

  private async getPortfolioMapping(portfolioId: string) {
    const { ncOfferingId, vertaloAllocationId } = await this.portfolio.api().getPortfolioVendorsConfiguration(portfolioId);

    return {
      offeringId: ncOfferingId,
      allocationId: vertaloAllocationId,
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

import { InvestmentAccounts } from 'InvestmentAccounts/index';

export class ProfileService {
  private investmentAccounts: InvestmentAccounts.Main;

  constructor(investmentAccounts: InvestmentAccounts.Main) {
    this.investmentAccounts = investmentAccounts;
  }

  public static getClassName = (): string => 'ProfileService';

  async createProfile(profileId: string): Promise<boolean> {
    return this.investmentAccounts.api().createProfile(profileId);
  }
}

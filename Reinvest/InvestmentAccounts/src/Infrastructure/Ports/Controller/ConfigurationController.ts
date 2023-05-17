import CreateConfiguration from 'Reinvest/InvestmentAccounts/src/Application/CreateConfiguration';

export class ConfigurationController {
  public static getClassName = (): string => 'ConfigurationController';

  private createConfigurationUseCase: CreateConfiguration;

  constructor(createConfiguration: CreateConfiguration) {
    this.createConfigurationUseCase = createConfiguration;
  }
  async createConfiguration(profileId: string, accountId: string, automaticDividendReinvestmentAgreement: boolean): Promise<boolean> {
    return this.createConfigurationUseCase.execute(profileId, accountId, automaticDividendReinvestmentAgreement);
  }
}

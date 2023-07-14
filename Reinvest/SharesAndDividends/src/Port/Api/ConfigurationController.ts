import CreateConfiguration from 'SharesAndDividends/UseCase/CreateConfiguration';
import GetConfiguration from 'SharesAndDividends/UseCase/GetConfiguration';

export class ConfigurationController {
  public static getClassName = (): string => 'ConfigurationController';

  private createConfigurationUseCase: CreateConfiguration;
  private getConfigurationUseCase: GetConfiguration;

  constructor(createConfiguration: CreateConfiguration, getConfiguration: GetConfiguration) {
    this.createConfigurationUseCase = createConfiguration;
    this.getConfigurationUseCase = getConfiguration;
  }
  async createConfiguration(profileId: string, accountId: string, automaticDividendReinvestmentAgreement: boolean): Promise<boolean> {
    return this.createConfigurationUseCase.execute(profileId, accountId, automaticDividendReinvestmentAgreement);
  }

  async getConfiguration(profileId: string, accountId: string) {
    return this.getConfigurationUseCase.execute(profileId, accountId);
  }
}

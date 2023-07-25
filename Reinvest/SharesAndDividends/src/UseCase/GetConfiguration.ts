import { ConfigurationRepository } from 'SharesAndDividends/Adapter/Database/Repository/ConfigurationRepository';
import { ConfigurationTypes } from 'SharesAndDividends/Domain/Configuration/ConfigurationTypes';

export type AccountConfigurationCreate = {
  accountId: string;
  id: string;
  profileId: string;
  type: ConfigurationTypes;
  value: boolean;
};

class GetConfiguration {
  static getClassName = (): string => 'GetConfiguration';

  private readonly configurationRepository: ConfigurationRepository;

  constructor(configurationRepository: ConfigurationRepository) {
    this.configurationRepository = configurationRepository;
  }

  async execute(profileId: string, accountId: string) {
    const lastConfiguration = await this.configurationRepository.getLastConfiguration(profileId, accountId);

    if (!lastConfiguration) return false;

    const config = lastConfiguration.transformIntoConfigurationObject();

    return config;
  }
}

export default GetConfiguration;

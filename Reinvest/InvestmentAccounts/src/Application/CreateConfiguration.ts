import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { ConfigurationTypes } from 'InvestmentAccounts/Domain/Configuration/ConfigurationTypes';
import { ConfigurationRepository } from 'InvestmentAccounts/Infrastructure/Storage/Repository/ConfigurationRepository';

export type AccountConfigurationCreate = {
  accountId: string;
  id: string;
  profileId: string;
  type: ConfigurationTypes;
  value: boolean;
};

class CreateConfiguration {
  static getClassName = (): string => 'CreateConfiguration';

  private readonly configurationRepository: ConfigurationRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(configurationRepository: ConfigurationRepository, idGenerator: IdGeneratorInterface) {
    this.configurationRepository = configurationRepository;
    this.idGenerator = idGenerator;
  }

  async execute(profileId: string, accountId: string, automaticDividendReinvestmentAgreement: boolean): Promise<boolean> {
    const lastConfiguration = await this.configurationRepository.getLastConfiguration(profileId, accountId);

    if (lastConfiguration?.configValueJson.value === automaticDividendReinvestmentAgreement) return false;

    const id = this.idGenerator.createUuid();

    const accountConfiguration: AccountConfigurationCreate = {
      id,
      profileId,
      accountId,
      value: automaticDividendReinvestmentAgreement,
      type: ConfigurationTypes.AUTOMATIC_DIVIDEND_REINVESTMENT_OPT_IN_OUT,
    };

    return this.configurationRepository.createConfiguration(accountConfiguration);
  }
}

export default CreateConfiguration;

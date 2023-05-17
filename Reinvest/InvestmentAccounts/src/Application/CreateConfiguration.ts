import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';

import { ConfigurationRepository } from '../Infrastructure/Storage/Repository/ConfigurationRepository';

class CreateConfiguration {
  static getClassName = (): string => 'CreateConfiguration';

  private readonly configurationRepository: ConfigurationRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(configurationRepository: ConfigurationRepository, idGenerator: IdGeneratorInterface) {
    this.configurationRepository = configurationRepository;
    this.idGenerator = idGenerator;
  }

  async execute(profileId: string, accountId: string, automaticDividendReinvestmentAgreement: boolean): Promise<boolean> {
    const id = this.idGenerator.createUuid();

    return this.configurationRepository.createConfiguration(id, profileId, accountId, automaticDividendReinvestmentAgreement);
  }
}

export default CreateConfiguration;

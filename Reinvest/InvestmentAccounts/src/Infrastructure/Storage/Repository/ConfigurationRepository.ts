import { JSONObject } from 'HKEKTypes/Generics';
import { ConfigurationTypes } from 'Reinvest/InvestmentAccounts/src/Domain/Configuration/ConfigurationTypes';

import { investmentAccountConfiguration, InvestmentAccountDbProvider } from '../DatabaseAdapter';

export class ConfigurationRepository {
  public static getClassName = (): string => 'ConfigurationRepository';

  private databaseAdapterProvider: InvestmentAccountDbProvider;

  constructor(databaseAdapterProvider: InvestmentAccountDbProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  async createConfiguration(configuration: any): Promise<boolean> {
    await this.databaseAdapterProvider
      .provide()
      .insertInto(investmentAccountConfiguration)
      .values({
        accountId: 'st',
        dateCreated: new Date(),
        dateUpdated: new Date(),
        profileId: 'sda',
        signed: false,
        configType: ConfigurationTypes.AUTOMATIC_DIVIDEND_REINVESTMENT_OPT_IN_OUT,
        configValueJson: <JSONObject>{ test: 'test' },
      })
      .execute();

    return false;
  }
}

import { JSONObject } from 'HKEKTypes/Generics';
import { ConfigurationTypes } from 'Reinvest/InvestmentAccounts/src/Domain/Configuration/ConfigurationTypes';

import { investmentAccountConfiguration, InvestmentAccountDbProvider } from '../DatabaseAdapter';

export class ConfigurationRepository {
  public static getClassName = (): string => 'ConfigurationRepository';

  private databaseAdapterProvider: InvestmentAccountDbProvider;

  constructor(databaseAdapterProvider: InvestmentAccountDbProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  async createConfiguration(id: string, profileId: string, accountId: string, automaticDividendReinvestmentAgreement: boolean): Promise<boolean> {
    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(investmentAccountConfiguration)
        .values({
          id,
          accountId,
          dateCreated: new Date(),
          dateUpdated: new Date(),
          profileId,
          configType: ConfigurationTypes.AUTOMATIC_DIVIDEND_REINVESTMENT_OPT_IN_OUT,
          configValueJson: <JSONObject>{ automaticDividendReinvestmentAgreement },
        })
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create configuration: ${error.message}`, error);

      return false;
    }
  }
}

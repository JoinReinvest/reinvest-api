import { JSONObject } from 'HKEKTypes/Generics';
import type { AccountConfigurationCreate } from 'Reinvest/InvestmentAccounts/src/Application/CreateConfiguration';
import { AccountConfiguration } from 'Reinvest/InvestmentAccounts/src/Domain/Configuration/AccountConfiguration';
import { ConfigurationTypes } from 'Reinvest/InvestmentAccounts/src/Domain/Configuration/ConfigurationTypes';

import { investmentAccountConfiguration, InvestmentAccountDbProvider } from '../DatabaseAdapter';

export class ConfigurationRepository {
  public static getClassName = (): string => 'ConfigurationRepository';

  private databaseAdapterProvider: InvestmentAccountDbProvider;

  constructor(databaseAdapterProvider: InvestmentAccountDbProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  async createConfiguration(config: AccountConfigurationCreate): Promise<boolean> {
    const { id, accountId, profileId, type, value } = config;
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
          configType: type,
          configValueJson: <JSONObject>{ value },
        })
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create configuration: ${error.message}`, error);

      return false;
    }
  }

  async getLastConfiguration(profileId: string, accountId: string): Promise<Omit<AccountConfiguration, 'id' | 'profileId' | 'accountId'> | undefined> {
    const lastConfiguration = await this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentAccountConfiguration)
      .select(['configValueJson', 'dateUpdated', 'dateCreated', 'configType'])
      .where('accountId', '=', accountId)
      .where('profileId', '=', profileId)
      .orderBy('dateUpdated', 'desc')
      .limit(1)
      .executeTakeFirst();

    return lastConfiguration;
  }
}

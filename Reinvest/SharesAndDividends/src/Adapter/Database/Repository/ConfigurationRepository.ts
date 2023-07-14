import { JSONObject } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { sadAccountsConfiguration, SharesAndDividendsDatabaseAdapterProvider } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { AutomaticDividendReinvestmentAgreement } from 'SharesAndDividends/Domain/Configuration/AutomaticDividendReinvestmentAgreement';
import type { AccountConfigurationCreate } from 'SharesAndDividends/UseCase/CreateConfiguration';

export class ConfigurationRepository {
  public static getClassName = (): string => 'ConfigurationRepository';

  private databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  async createConfiguration(config: AccountConfigurationCreate): Promise<boolean> {
    const { id, accountId, profileId, type, value } = config;
    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(sadAccountsConfiguration)
        .values({
          id,
          accountId,
          dateCreated: DateTime.now().toDate(),
          dateUpdated: DateTime.now().toDate(),
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

  async getLastConfiguration(profileId: string, accountId: string): Promise<AutomaticDividendReinvestmentAgreement | false> {
    const lastConfiguration = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadAccountsConfiguration)
      .select(['id', 'profileId', 'accountId', 'configValueJson', 'dateUpdated', 'dateCreated', 'configType'])
      .where('accountId', '=', accountId)
      .where('profileId', '=', profileId)
      .orderBy('dateUpdated', 'desc')
      .limit(1)
      .executeTakeFirst();

    if (!lastConfiguration) return false;

    return AutomaticDividendReinvestmentAgreement.create(lastConfiguration);
  }
}

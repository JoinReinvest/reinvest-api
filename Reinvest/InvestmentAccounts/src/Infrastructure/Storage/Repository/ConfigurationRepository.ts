import { JSONObject } from 'HKEKTypes/Generics';
import { investmentAccountConfiguration, InvestmentAccountDbProvider } from 'InvestmentAccounts/Infrastructure/Storage/DatabaseAdapter';
import type { AccountConfigurationCreate } from 'Reinvest/InvestmentAccounts/src/Application/CreateConfiguration';
import { AutomaticDividendReinvestmentAgreement } from 'Reinvest/InvestmentAccounts/src/Domain/ValueObject/AutomaticDividendReinvestmentAgreement';

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

  async getLastConfiguration(profileId: string, accountId: string): Promise<AutomaticDividendReinvestmentAgreement | false> {
    const lastConfiguration = await this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentAccountConfiguration)
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

import { JSONObject } from 'HKEKTypes/Generics';
import { AccountConfiguration } from 'InvestmentAccounts/Domain/Configuration/AccountConfiguration';
import { ConfigurationTypes } from 'InvestmentAccounts/Domain/Configuration/ConfigurationTypes';

export class AutomaticDividendReinvestmentAgreement implements AccountConfiguration {
  profileId: string;
  accountId: string;
  configType: ConfigurationTypes;
  configValueJson: JSONObject;
  dateCreated: Date;
  dateUpdated: Date;
  id: string;

  constructor(
    profileId: string,
    accountId: string,
    configType: ConfigurationTypes,
    configValueJson: JSONObject,
    dateCreated: Date,
    dateUpdated: Date,
    id: string,
  ) {
    this.profileId = profileId;
    this.accountId = accountId;
    this.configType = configType;
    this.configValueJson = configValueJson;
    this.dateCreated = dateCreated;
    this.dateUpdated = dateUpdated;
    this.id = id;
  }

  static create(data: AccountConfiguration) {
    const { profileId, accountId, configType, configValueJson, dateCreated, dateUpdated, id } = data;

    return new AutomaticDividendReinvestmentAgreement(profileId, accountId, configType, configValueJson, dateCreated, dateUpdated, id);
  }

  isTheSameValue(value: boolean): boolean {
    if (this.configValueJson.value === value) return true;

    return false;
  }
}

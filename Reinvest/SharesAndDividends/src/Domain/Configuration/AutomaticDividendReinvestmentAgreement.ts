import { JSONObject } from 'HKEKTypes/Generics';
import { AccountConfiguration } from 'SharesAndDividends/Domain/Configuration/AccountConfiguration';
import { ConfigurationTypes } from 'SharesAndDividends/Domain/Configuration/ConfigurationTypes';

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
    return this.configValueJson.value === value;
  }

  transformIntoConfigurationObject() {
    switch (this.configType) {
      case ConfigurationTypes.AUTOMATIC_DIVIDEND_REINVESTMENT_OPT_IN_OUT: {
        return {
          automaticDividendReinvestmentAgreement: {
            signed: this.configValueJson.value,
            date: this.dateCreated,
          },
        };
      }
    }
  }
}

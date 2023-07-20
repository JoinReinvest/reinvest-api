import { JSONObject } from 'HKEKTypes/Generics';
import { ConfigurationTypes } from 'Reinvest/SharesAndDividends/src/Domain/Configuration/ConfigurationTypes';

export type AccountConfiguration = {
  accountId: string;
  configType: ConfigurationTypes;
  configValueJson: JSONObject;
  dateCreated: Date;
  dateUpdated: Date;
  id: string;
  profileId: string;
};

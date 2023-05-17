import { JSONObject } from 'HKEKTypes/Generics';

import { ConfigurationTypes } from './ConfigurationTypes';

export type AccountConfiguration = {
  accountId: string;
  configType: ConfigurationTypes;
  configValueJson: JSONObject;
  dateCreated: Date;
  dateUpdated: Date;
  id: string;
  profileId: string;
};

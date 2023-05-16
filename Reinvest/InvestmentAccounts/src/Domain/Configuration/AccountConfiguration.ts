import { ConfigurationTypes } from './ConfigurationTypes';

export type AccountConfiguration = {
  accountId: string;
  configType: ConfigurationTypes;
  configValueJson: string;
  dateCreated: Date;
  dateUpdated: Date;
  profileId: string;
  signed: boolean;
};

import crypto from 'crypto';
import { JSONObject, UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';

export type AccountActivitySchema = {
  accountId: UUID | null;
  activityDate: DateTime;
  activityName: string;
  dataJson: JSONObject | null;
  hash: string;
  profileId: UUID;
};

export type AccountView = {
  activityName: string;
  data: {
    origin?: string;
    tradeId?: string;
  };
  date: string;
};

export class AccountActivity {
  private accountActivitySchema: AccountActivitySchema;

  constructor(accountActivitySchema: AccountActivitySchema) {
    this.accountActivitySchema = accountActivitySchema;
  }

  static create(profileId: UUID, accountId: UUID | null, activityName: string, activityDate: DateTime, dataJson: JSONObject) {
    const accountActivitySchema = <AccountActivitySchema>{
      accountId,
      activityDate,
      activityName,
      dataJson,
      hash: this.hashData(profileId, accountId, activityName, activityDate, dataJson),
      profileId,
    };

    return new AccountActivity(accountActivitySchema);
  }

  private static hashData(profileId: UUID, accountId: UUID | null, activityName: string, activityDate: DateTime, dataJson: JSONObject): string {
    const value = `${profileId}${accountId}${activityName}${activityDate.toIsoDateTime()}${JSON.stringify(dataJson)}`;

    return crypto.createHash('sha256').update(value).digest('hex');
  }

  static restore(accountActivitySchema: AccountActivitySchema) {
    return new AccountActivity(accountActivitySchema);
  }

  toObject(): AccountActivitySchema {
    return this.accountActivitySchema;
  }

  getView(): AccountView {
    const dataView = {};
    const data = this.accountActivitySchema.dataJson;

    if (data?.tradeId) {
      // @ts-ignore
      dataView['tradeId'] = data.tradeId;
    }

    if (data?.origin) {
      // @ts-ignore
      dataView['origin'] = data.origin;
    }

    return {
      activityName: this.accountActivitySchema.activityName,
      date: this.accountActivitySchema.activityDate.toIsoDateTime(),
      data: dataView,
    };
  }
}

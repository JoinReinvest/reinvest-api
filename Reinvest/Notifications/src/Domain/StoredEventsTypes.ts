import { JSONObject } from 'HKEKTypes/Generics';

export enum StoredEventKind {
  UserRegistered = 'UserRegistered',
  IndividualAccountOpened = 'IndividualAccountOpened',
  CorporateAccountOpened = 'CorporateAccountOpened',
  TrustAccountOpened = 'TrustAccountOpened',
}

type InAppNotificationType = {
  body: (...payload: any[]) => string;
  title: (...payload: any[]) => string;
};
type EmailNotificationType = {
  body: (...payload: any[]) => string;
  subject: (...payload: any[]) => string;
};
type PushNotificationType = {
  body: (...payload: any[]) => string;
  title: (...payload: any[]) => string;
};
type AccountActivityType = {
  data: (...payload: any[]) => JSONObject;
  name: (...payload: any[]) => string;
};
type AnalyticEventType = {
  data: (...payload: any[]) => JSONObject;
  name: (...payload: any[]) => string;
};

export type StoredEventConfigurationType = {
  accountActivity?: AccountActivityType;
  analyticEvent?: AnalyticEventType;
  email?: EmailNotificationType;
  inApp?: InAppNotificationType;
  push?: PushNotificationType;
};

type StoredEventsType = {
  [kind in StoredEventKind]: StoredEventConfigurationType;
};

export const StoredEvents = <StoredEventsType>{
  UserRegistered: {},
  CorporateAccountOpened: {
    accountActivity: {
      data: (accountId: string, label: string) => ({ accountId, label }),
      name: (label: string) => `Corporate Account "${label}" Opened`,
    },
  },
  TrustAccountOpened: {
    accountActivity: {
      data: (accountId: string, label: string) => ({ accountId, label }),
      name: (label: string) => `Trust Account "${label}" Opened`,
    },
  },
  IndividualAccountOpened: {
    accountActivity: {
      data: (accountId: string) => ({ accountId }),
      name: () => 'Individual Account Opened',
    },
  },
};

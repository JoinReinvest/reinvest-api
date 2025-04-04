import { DictionaryType, JSONObject } from 'HKEKTypes/Generics';
import { NotificationObjectType, NotificationsType } from 'Notifications/Domain/Notification';
import { StoredEventKind } from 'Notifications/Domain/StoredEventsConfiguration';

type InAppNotificationType = {
  body: (payload: DictionaryType) => string;
  header: (payload: DictionaryType) => string;
  notificationType: NotificationsType;
  onObject?: (payload: DictionaryType) => {
    onObjectId: string | null;
    onObjectType: NotificationObjectType | null;
  };
};
type EmailNotificationType = {
  body: (payload: DictionaryType) => string;
  subject: (payload: DictionaryType) => string;
  toAdmin?: boolean;
};
type PushNotificationType = {
  body: (payload: DictionaryType) => string;
  title: (payload: DictionaryType) => string;
};
type AccountActivityType = {
  name: (payload: DictionaryType) => string;
  data?: (payload: DictionaryType) => JSONObject;
};
type AnalyticEventType = {
  eventName: string;
  data?: (payload: DictionaryType) => JSONObject;
  identityData?: (payload: DictionaryType) => JSONObject;
  sendIdentity?: (payload: DictionaryType) => boolean;
};

export type StoredEventConfigurationType = {
  accountActivity?: AccountActivityType;
  analyticEvent?: AnalyticEventType;
  email?: EmailNotificationType;
  inApp?: InAppNotificationType;
  push?: PushNotificationType;
};

export type StoredEventsType = Record<StoredEventKind, StoredEventConfigurationType>;

import { DictionaryType, JSONObject, UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { CreateNewNotificationInput } from 'Notifications/Application/UseCase/CreateNotification';
import { StoredEventKind, StoredEvents } from 'Notifications/Domain/StoredEventsConfiguration';
import { StoredEventConfigurationType } from 'Notifications/Domain/StoredEventTypes';

export enum StoredEventStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export type StoredEventSchema = {
  dateAccountActivity: DateTime | null;
  dateAnalytics: DateTime | null;
  dateCreated: DateTime;
  dateEmailed: DateTime | null;
  dateInApp: DateTime | null;
  datePushed: DateTime | null;
  id: UUID;
  kind: StoredEventKind;
  payload: DictionaryType;
  profileId: UUID;
  status: StoredEventStatus;
};

export class StoredEvent {
  private storedEventSchema: StoredEventSchema;
  private storedEventConfiguration: StoredEventConfigurationType;

  constructor(storedEventSchema: StoredEventSchema) {
    this.storedEventSchema = storedEventSchema;
    this.storedEventConfiguration = StoredEvents[this.storedEventSchema.kind] ?? {};
  }

  static create(id: UUID, profileId: UUID, kind: StoredEventKind, payload: JSONObject, eventDate: DateTime) {
    const storedEventSchema = <StoredEventSchema>{
      id,
      kind,
      payload,
      status: StoredEventStatus.PENDING,
      dateCreated: eventDate,
      dateAccountActivity: null,
      dateAnalytics: null,
      dateEmailed: null,
      dateInApp: null,
      datePushed: null,
      profileId,
    };

    return new StoredEvent(storedEventSchema);
  }

  static restore(storedEventSchema: StoredEventSchema) {
    return new StoredEvent(storedEventSchema);
  }

  toObject(): StoredEventSchema {
    return this.storedEventSchema;
  }

  shouldProcessAccountActivity(): boolean {
    return !!this.storedEventConfiguration.accountActivity && this.storedEventSchema.dateAccountActivity === null;
  }

  shouldProcessAnalyticEvent(): boolean {
    return !!this.storedEventConfiguration.analyticEvent && this.storedEventSchema.dateAnalytics === null;
  }

  shouldProcessEmail(): boolean {
    return !!this.storedEventConfiguration.email && this.storedEventSchema.dateEmailed === null;
  }

  shouldProcessInApp(): boolean {
    return !!this.storedEventConfiguration.inApp && this.storedEventSchema.dateInApp === null;
  }

  shouldProcessPush(): boolean {
    return !!this.storedEventConfiguration.push && this.storedEventSchema.datePushed === null;
  }

  getAccountActivity(): {
    accountId: UUID | null;
    data: JSONObject;
    date: DateTime;
    name: string;
    profileId: UUID;
  } {
    const accountActivity = this.storedEventConfiguration.accountActivity;
    const data = accountActivity!.data(this.storedEventSchema.payload);

    return {
      accountId: <UUID>this.storedEventSchema.payload['accountId'] ?? null,
      data,
      date: this.storedEventSchema.dateCreated,
      name: accountActivity!.name(this.storedEventSchema.payload),
      profileId: this.storedEventSchema.profileId,
    };
  }

  markAccountActivityAsProcessed() {
    this.storedEventSchema.dateAccountActivity = DateTime.now();
  }

  markPushAsProcessed() {
    this.storedEventSchema.datePushed = DateTime.now();
  }

  markInAppAsProcessed() {
    this.storedEventSchema.dateInApp = DateTime.now();
  }

  markAsProcessed() {
    this.storedEventSchema.status = StoredEventStatus.PROCESSED;
  }

  markAsFailed() {
    this.storedEventSchema.status = StoredEventStatus.FAILED;
  }

  getNotification(): CreateNewNotificationInput {
    const inAppNotificationConfiguration = this.storedEventConfiguration.inApp;

    if (!inAppNotificationConfiguration) {
      throw new Error(`Notification configuration not found for type: ${this.storedEventSchema.kind}`);
    }

    const { onObjectId, onObjectType } = inAppNotificationConfiguration.onObject(this.storedEventSchema.payload);

    return {
      accountId: <UUID>this.storedEventSchema.payload['accountId'] ?? null,
      body: inAppNotificationConfiguration.body(this.storedEventSchema.payload),
      header: inAppNotificationConfiguration.header(this.storedEventSchema.payload),
      notificationType: inAppNotificationConfiguration.notificationType,
      onObjectId,
      onObjectType,
      profileId: this.storedEventSchema.profileId,
      uniqueId: this.storedEventSchema.id,
    };
  }

  getId(): UUID {
    return this.storedEventSchema.id;
  }

  getPushNotification(): {
    body: string;
    profileId: UUID;
    title: string;
  } {
    const pushNotificationConfiguration = this.storedEventConfiguration.push;

    if (!pushNotificationConfiguration) {
      throw new Error(`Push notification configuration not found for type: ${this.storedEventSchema.kind}`);
    }

    return {
      body: pushNotificationConfiguration.body(this.storedEventSchema.payload),
      profileId: this.storedEventSchema.profileId,
      title: pushNotificationConfiguration.title(this.storedEventSchema.payload),
    };
  }
}

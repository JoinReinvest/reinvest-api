import { DictionaryType, JSONObject, UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { AnalyticsCommand } from 'Notifications/Adapter/AnalyticsAdapter';
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

export type GlobalValues = {
  email: string;
  userName: string;
};

export class StoredEvent {
  private storedEventSchema: StoredEventSchema;
  private storedEventConfiguration: StoredEventConfigurationType;
  private globalValues: GlobalValues | null = null;

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

  markAccountActivityAsProcessed() {
    this.storedEventSchema.dateAccountActivity = DateTime.now();
  }

  markPushAsProcessed() {
    this.storedEventSchema.datePushed = DateTime.now();
  }

  markInAppAsProcessed() {
    this.storedEventSchema.dateInApp = DateTime.now();
  }

  markEmailAsProcessed() {
    this.storedEventSchema.dateEmailed = DateTime.now();
  }

  markAnalyticEventAsProcessed() {
    this.storedEventSchema.dateAnalytics = DateTime.now();
  }

  markAsProcessed() {
    this.storedEventSchema.status = StoredEventStatus.PROCESSED;
  }

  markAsFailed() {
    this.storedEventSchema.status = StoredEventStatus.FAILED;
  }

  getAccountActivity(): {
    accountId: UUID | null;
    data: JSONObject;
    date: DateTime;
    name: string;
    profileId: UUID;
  } {
    const accountActivity = this.storedEventConfiguration.accountActivity;
    const payload = this.getPayload();
    const data = accountActivity?.data ? accountActivity.data(payload) : {};

    return {
      accountId: <UUID>payload['accountId'] ?? null,
      data,
      date: this.storedEventSchema.dateCreated,
      name: accountActivity!.name(payload),
      profileId: this.storedEventSchema.profileId,
    };
  }

  getNotification(): CreateNewNotificationInput {
    const inAppNotificationConfiguration = this.storedEventConfiguration.inApp;

    if (!inAppNotificationConfiguration) {
      throw new Error(`Notification configuration not found for type: ${this.storedEventSchema.kind}`);
    }

    const payload = this.getPayload();
    const { onObjectId, onObjectType } = inAppNotificationConfiguration.onObject
      ? inAppNotificationConfiguration.onObject(payload)
      : {
          onObjectType: null,
          onObjectId: null,
        };

    const uniqueId = payload?.uniqueId ?? this.storedEventSchema.id;
    const dismissId = payload?.dismissId ?? null;

    return {
      accountId: <UUID>payload['accountId'] ?? null,
      body: inAppNotificationConfiguration.body(payload),
      header: inAppNotificationConfiguration.header(payload),
      notificationType: inAppNotificationConfiguration.notificationType,
      onObjectId,
      onObjectType,
      profileId: this.storedEventSchema.profileId,
      uniqueId: uniqueId,
      dismissId: dismissId,
    };
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

    const payload = this.getPayload();

    return {
      body: pushNotificationConfiguration.body(payload),
      profileId: this.storedEventSchema.profileId,
      title: pushNotificationConfiguration.title(payload),
    };
  }

  getEmailNotification() {
    const emailConfiguration = this.storedEventConfiguration.email;

    if (!emailConfiguration) {
      throw new Error(`Email notification configuration not found for type: ${this.storedEventSchema.kind}`);
    }

    const payload = this.getPayload();

    return {
      subject: emailConfiguration.subject(payload),
      body: emailConfiguration.body(payload),
    };
  }

  getAnalyticsCommand(): AnalyticsCommand {
    const config = this.storedEventConfiguration.analyticEvent;

    if (!config) {
      throw new Error(`Analytics configuration not found for type: ${this.storedEventSchema.kind}`);
    }

    const payload = this.getPayload();
    const eventName = config.eventName;
    const data = config.data ? config.data(payload) : {};
    const identityData = config.identityData ? config.identityData(payload) : {};
    const sendIdentity = config.sendIdentity ? config.sendIdentity(payload) : false;

    if (sendIdentity && !!this.getUserEmail()) {
      identityData['email'] = this.getUserEmail()!;
    }

    return {
      profileId: this.storedEventSchema.profileId,
      eventName,
      data,
      identityData,
      sendIdentity,
    };
  }

  private getPayload(): DictionaryType {
    const { email, ...globals } = this.globalValues ?? {};

    return { ...(globals ?? { userName: 'Investor' }), ...this.storedEventSchema.payload };
  }

  getId(): UUID {
    return this.storedEventSchema.id;
  }

  getProfileId(): UUID {
    return this.storedEventSchema.profileId;
  }

  setGlobalValues(globalValues: GlobalValues | null): void {
    this.globalValues = globalValues;
  }

  getUserEmail(): string | null {
    if (!this.globalValues || !this.globalValues.email) {
      return null;
    }

    return this.globalValues.email;
  }
}

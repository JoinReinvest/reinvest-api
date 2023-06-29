import { JSONObject, UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { StoredEventConfigurationType, StoredEventKind, StoredEvents } from 'Notifications/Domain/StoredEventsTypes';

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
  payload: JSONObject;
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

  getEventDate(): DateTime {
    return this.storedEventSchema.dateCreated;
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
      accountId: <UUID>data['accountId'] ?? null,
      data,
      date: this.storedEventSchema.dateCreated,
      name: accountActivity!.name(this.storedEventSchema.payload),
      profileId: this.storedEventSchema.profileId,
    };
  }

  markAccountActivityAsProcessed() {
    this.storedEventSchema.dateAccountActivity = DateTime.now();
  }

  markAsProcessed() {
    this.storedEventSchema.status = StoredEventStatus.PROCESSED;
  }

  markAsFailed() {
    this.storedEventSchema.status = StoredEventStatus.FAILED;
  }
}

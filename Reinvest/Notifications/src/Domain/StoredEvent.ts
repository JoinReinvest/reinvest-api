import { JSONObject, UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';

export enum StoredEventKind {
  UserRegistered = 'UserRegistered',
}

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
  private storedEventSchema1: StoredEventSchema;

  constructor(storedEventSchema: StoredEventSchema) {
    this.storedEventSchema1 = storedEventSchema;
  }

  static create(id: UUID, profileId: UUID, kind: StoredEventKind, payload: JSONObject) {
    const storedEventSchema = <StoredEventSchema>{
      id,
      kind,
      payload,
      status: StoredEventStatus.PENDING,
      dateCreated: DateTime.now(),
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
    return this.storedEventSchema1;
  }
}

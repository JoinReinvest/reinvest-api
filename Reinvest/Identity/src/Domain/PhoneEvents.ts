import { DomainEvent } from 'SimpleAggregator/Types';

export type PhoneEvent = DomainEvent;

export type TOPTExpired = PhoneEvent & {
  data: {
    status: false;
  };
  kind: 'TOPTExpired';
};

export type TOPTTriesExceeded = PhoneEvent & {
  data: {
    status: false;
  };
  kind: 'TOPTTriesExceeded';
};

export type TOPTVerified = PhoneEvent & {
  data: {
    phoneNumber: string;
    status: true;
  };
  kind: 'TOPTVerified';
};

export type TOPTInvalid = PhoneEvent & {
  data: {
    status: false;
    tries: number;
  };
  kind: 'TOPTInvalid';
};

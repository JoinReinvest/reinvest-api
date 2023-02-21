import {DomainEvent} from "SimpleAggregator/Types";

export type PhoneEvent = DomainEvent;

export type TOPTExpired = PhoneEvent & {
    kind: "TOPTExpired",
    data: {
        status: false,
    }
}

export type TOPTTriesExceeded = PhoneEvent & {
    kind: "TOPTTriesExceeded",
    data: {
        status: false,
    }
}

export type TOPTVerified = PhoneEvent & {
    kind: "TOPTVerified",
    data: {
        status: true,
        phoneNumber: string
    }
}

export type TOPTInvalid = PhoneEvent & {
    kind: "TOPTInvalid",
    data: {
        status: false,
        tries: number,
    }
}
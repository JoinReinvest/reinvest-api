import DomainEventType from "../../shared/SimpleAggregator/DomainEventType";

export type ProfileEvent = DomainEventType;

export const profileEvents = {
    ProfileCreated: 'ProfileCreated',
    IndividualAttachedToProfile: 'IndividualAttachedToProfile',

}

export function createEvent<Event>(kind: string, data = {}): ProfileEvent | Event {
    return {
        kind,
        data,
    }
}

export type ProfileCreated = ProfileEvent & {
    kind: 'ProfileCreated',
    data: {
        individualId: string,
    }
}

export type IndividualAttachedToProfile = ProfileEvent & {
    kind: 'IndividualAttachedToProfile',
    data: {
        individualId: string,
    }
}
import {
    DomainEvent
} from "SimpleAggregator/Types";

export type ProfileCreated = DomainEvent & {
    kind: "ProfileCreated",
    data: {
        userId: string
    }
}

export type IndividualAttachedToProfile = DomainEvent & {
    kind: "IndividualAttachedToProfile",
    data: {
        individualId: string
    }
}



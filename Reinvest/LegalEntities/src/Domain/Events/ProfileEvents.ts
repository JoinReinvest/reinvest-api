import {
    DomainEvent
} from "SimpleAggregator/Types";

export type LegalProfileCompleted = DomainEvent & {
    kind: "LegalProfileCompleted",
    data: {
        profileId: string
    }
}



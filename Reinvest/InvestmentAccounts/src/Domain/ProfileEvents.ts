import {
    DomainEvent
} from "SimpleAggregator/Types";

export type ProfileCreated = DomainEvent & {
    kind: "ProfileCreated",
    data: {
        individualAccountId: null,
        corporateAccountIds: [],
        trustAccountIds: [],
    }
}

export type IndividualAttachedToProfile = DomainEvent & {
    kind: "IndividualAttachedToProfile",
    data: {
        individualId: string
    }
}



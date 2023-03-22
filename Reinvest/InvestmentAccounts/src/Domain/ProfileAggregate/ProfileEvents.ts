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

export type IndividualAccountOpened = DomainEvent & {
    kind: "IndividualAccountOpened",
    data: {
        individualAccountId: string
    }
}



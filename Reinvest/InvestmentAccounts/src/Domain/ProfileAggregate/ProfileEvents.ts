import {
    DomainEvent
} from "SimpleAggregator/Types";

export type ProfileCreated = DomainEvent & {
    kind: "ProfileCreated",
    data: {
        individualAccountId: null,
        corporateAccountIds: [],
        trustAccountIds: [],
        beneficiaryAccountIds: [],
    }
}

export type IndividualAccountOpened = DomainEvent & {
    kind: "IndividualAccountOpened",
    data: {
        individualAccountIds: string[]
    }
}

export type CorporateAccountOpened = DomainEvent & {
    kind: "CorporateAccountOpened",
    data: {
        corporateAccountIds: string[]
    }
}

export type TrustAccountOpened = DomainEvent & {
    kind: "TrustAccountOpened",
    data: {
        trustAccountIds: string[]
    }
}

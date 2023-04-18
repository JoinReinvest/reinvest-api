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
        individualAccountId: string
    }
}

export type CorporateAccountOpened = DomainEvent & {
    kind: "CorporateAccountOpened",
    data: {
        corporateAccountId: string
    }
}

export type TrustAccountOpened = DomainEvent & {
    kind: "TrustAccountOpened",
    data: {
        trustAccountId: string
    }
}

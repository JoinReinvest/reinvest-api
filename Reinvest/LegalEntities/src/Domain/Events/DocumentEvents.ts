import {DomainEvent} from "SimpleAggregator/Types";
import {DocumentSchema} from "LegalEntities/Domain/ValueObject/Document";

export type LegalEntityDocumentRemoved = DomainEvent & {
    kind: "LegalEntityDocumentRemoved",
    id: string,
    data: {
        path: string,
    }
}

export const getDocumentRemoveEvent = (document: DocumentSchema): LegalEntityDocumentRemoved => ({
    kind: "LegalEntityDocumentRemoved",
    id: document.id,
    data: {
        path: document.path,
    }
});

export type LegalEntityAvatarRemoved = DomainEvent & {
    kind: "LegalEntityAvatarRemoved",
    id: string,
    data: {
        path: string,
    }
}

export const getAvatarRemoveEvent = (document: DocumentSchema): LegalEntityAvatarRemoved => ({
    kind: "LegalEntityAvatarRemoved",
    id: document.id,
    data: {
        path: document.path,
    }
});
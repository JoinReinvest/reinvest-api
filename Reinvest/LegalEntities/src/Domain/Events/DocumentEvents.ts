import { AvatarInput, DocumentSchema } from 'LegalEntities/Domain/ValueObject/Document';
import { DomainEvent } from 'SimpleAggregator/Types';

export type LegalEntityDocumentRemoved = DomainEvent & {
  data: {
    path: string;
  };
  id: string;
  kind: 'LegalEntityDocumentRemoved';
};

export const getDocumentRemoveEvent = (document: DocumentSchema): LegalEntityDocumentRemoved => ({
  kind: 'LegalEntityDocumentRemoved',
  id: document.id,
  data: {
    path: document.path,
  },
});

export type LegalEntityAvatarRemoved = DomainEvent & {
  data: {
    path: string;
  };
  id: string;
  kind: 'LegalEntityAvatarRemoved';
};

export const getAvatarRemoveEvent = (avatar: AvatarInput): LegalEntityAvatarRemoved => ({
  kind: 'LegalEntityAvatarRemoved',
  id: avatar.id,
  data: {
    path: avatar.path,
  },
});

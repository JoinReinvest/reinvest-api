import { DraftAccountRepository } from 'LegalEntities/Adapter/Database/Repository/DraftAccountRepository';
import { DomainEvent } from 'SimpleAggregator/Types';

export class RemoveDraftAccount {
  public static getClassName = (): string => 'RemoveDraftAccount';
  private draftAccountRepository: DraftAccountRepository;

  constructor(draftAccountRepository: DraftAccountRepository) {
    this.draftAccountRepository = draftAccountRepository;
  }

  async execute(profileId: string, draftId: string): Promise<boolean> {
    const draft = await this.draftAccountRepository.getDraftForProfile(profileId, draftId);
    let events: DomainEvent[] = [];
    const avatarRemoved = draft.removeAvatar();

    if (avatarRemoved) {
      events.push(avatarRemoved);
    }

    const documentsRemoved = draft.removeAllDocuments();

    if (documentsRemoved.length > 0) {
      events = events.concat(documentsRemoved);
    }

    const stakeholderDocumentsRemoved = draft.removeAllStakeholders();

    if (stakeholderDocumentsRemoved.length > 0) {
      events = events.concat(stakeholderDocumentsRemoved);
    }

    return this.draftAccountRepository.removeDraft(profileId, draftId, events);
  }
}

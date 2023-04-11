import { DraftAccountRepository } from 'LegalEntities/Adapter/Database/Repository/DraftAccountRepository';

export class RemoveDraftAccount {
  private draftAccountRepository: DraftAccountRepository;

  constructor(draftAccountRepository: DraftAccountRepository) {
    this.draftAccountRepository = draftAccountRepository;
  }

  public static getClassName = (): string => 'RemoveDraftAccount';

  async execute(profileId: string, draftId: string): Promise<boolean> {
    return await this.draftAccountRepository.removeDraft(profileId, draftId);
  }
}

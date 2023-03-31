import { DraftAccountRepository } from 'LegalEntities/Adapter/Database/Repository/DraftAccountRepository';

export class RemoveDraftAccount {
  public static getClassName = (): string => 'RemoveDraftAccount';
  private draftAccountRepository: DraftAccountRepository;

  constructor(draftAccountRepository: DraftAccountRepository) {
    this.draftAccountRepository = draftAccountRepository;
  }

  async execute(profileId: string, draftId: string): Promise<boolean> {
    return await this.draftAccountRepository.removeDraft(profileId, draftId);
  }
}

import { FileLink } from 'Documents/Adapter/S3/FileLinkService';
import { DraftAccountRepository } from 'LegalEntities/Adapter/Database/Repository/DraftAccountRepository';
import { DocumentsService } from 'LegalEntities/Adapter/Modules/DocumentsService';
import { DraftAccount, DraftAccountState, DraftAccountType, IndividualDraftAccountSchema } from 'LegalEntities/Domain/DraftAccount/DraftAccount';

export type DraftQuery = {
  avatar: FileLink | null;
  details: IndividualDraftAccountSchema | null;
  id: string;
  isCompleted: boolean;
  state: DraftAccountState;
};

export type DraftsList = {
  id: string;
  type: DraftAccountType;
}[];

export class DraftAccountQuery {
  public static getClassName = (): string => 'DraftAccountQuery';
  private draftAccountRepository: DraftAccountRepository;
  private documents: DocumentsService;

  constructor(draftAccountRepository: DraftAccountRepository, documents: DocumentsService) {
    this.draftAccountRepository = draftAccountRepository;
    this.documents = documents;
  }

  async getDraftDetails(profileId: string, draftId: string, accountType: DraftAccountType): Promise<DraftQuery | null> {
    const draft = await this.draftAccountRepository.getDraftForProfile<DraftAccount>(profileId, draftId);

    if (!draft.isType(accountType)) {
      return null;
    }

    const { state, data } = draft.toObject();

    return {
      id: draftId,
      state: state,
      isCompleted: data?.isCompleted ?? false,
      // @ts-ignore
      avatar: await this.documents.getAvatarFileLink(data?.avatar ?? null),
      details: data,
    };
  }

  async listDrafts(profileId: string): Promise<DraftsList> {
    return this.draftAccountRepository.getAllActiveDraftsIds(profileId);
  }
}

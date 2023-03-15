import {DraftAccountRepository} from "LegalEntities/Adapter/Database/Repository/DraftAccountRepository";
import {
    DraftAccount,
    DraftAccountState, DraftAccountType,
    IndividualDraftAccountSchema
} from "LegalEntities/Domain/DraftAccount/DraftAccount";
import {DocumentsService} from "LegalEntities/Adapter/Modules/DocumentsService";
import {FileLink} from "Documents/Adapter/S3/FileLinkService";

export type DraftQuery = {
    id: string,
    state: DraftAccountState,
    avatar: FileLink | null,
    isCompleted: boolean,
    details: IndividualDraftAccountSchema | null
}

export class DraftAccountQuery {
    public static getClassName = (): string => "DraftAccountQuery";
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

        const {state, data} = draft.toObject();
        return {
            id: draftId,
            state: state,
            isCompleted: data?.isCompleted ?? false,
            avatar: await this.documents.getAvatarFileLink(data?.avatar ?? null),
            details: data
        }
    }
}
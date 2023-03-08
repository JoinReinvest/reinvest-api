import {DraftAccountRepository} from "LegalEntities/Adapter/Database/Repository/DraftAccountRepository";
import {
    DraftAccount,
    DraftAccountState, DraftAccountType,
    IndividualDraftAccountSchema
} from "LegalEntities/Domain/DraftAccount/DraftAccount";

export type DraftQuery = {
    id: string,
    state: DraftAccountState,
    details: IndividualDraftAccountSchema | null
}

export class DraftAccountQuery {
    public static getClassName = (): string => "DraftAccountQuery";
    private draftAccountRepository: DraftAccountRepository;

    constructor(draftAccountRepository: DraftAccountRepository) {
        this.draftAccountRepository = draftAccountRepository;
    }

    async getDraftDetails(profileId: string, draftId: string, accountType: DraftAccountType): Promise<DraftQuery | null> {
        const draft = await this.draftAccountRepository.getDraftForProfile<DraftAccount>(profileId, draftId);

        if (!draft.isType(accountType)) {
            return null;
        }

        const draftObject = draft.toObject();
        return {
            id: draftId,
            state: draftObject.state,
            details: draftObject.data
        }
    }
}
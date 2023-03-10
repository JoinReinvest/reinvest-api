import {DraftAccountRepository} from "LegalEntities/Adapter/Database/Repository/DraftAccountRepository";
import {IdGenerator} from "IdGenerator/IdGenerator";
import {DraftAccount, DraftAccountState, DraftAccountType} from "LegalEntities/Domain/DraftAccount/DraftAccount";

export class CreateDraftAccount {
    public static getClassName = (): string => "CreateDraftAccount";
    private draftAccountRepository: DraftAccountRepository;

    constructor(draftAccountRepository: DraftAccountRepository) {
        this.draftAccountRepository = draftAccountRepository;
    }

    async execute(profileId: string, type: DraftAccountType) {
        const activeDrafts = await this.draftAccountRepository.getActiveDraftsOfType(type, profileId);
        if (activeDrafts.length > 0) {
            throw new Error('Draft account already exist');
        }

        const draftId = (new IdGenerator()).createUuid();
        const draft = DraftAccount.create({
            profileId,
            draftId,
            state: DraftAccountState.ACTIVE,
            accountType: type,
            data: null
        });
        const status = await this.draftAccountRepository.storeDraft(draft);

        if (!status) {
            throw new Error('Cannot create draft account');
        }

        return draftId;
    }
}
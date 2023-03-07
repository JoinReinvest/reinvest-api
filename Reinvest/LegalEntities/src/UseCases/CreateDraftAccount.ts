import {DraftAccountRepository} from "LegalEntities/Adapter/Database/Repository/DraftAccountRepository";
import {IdGenerator} from "IdGenerator/IdGenerator";
import {AccountType} from "LegalEntities/Domain/AccountType";

export class CreateDraftAccount {
    public static getClassName = (): string => "CreateDraftAccount";
    private draftAccountRepository: DraftAccountRepository;

    constructor(draftAccountRepository: DraftAccountRepository) {
        this.draftAccountRepository = draftAccountRepository;
    }

    async execute(profileId: string, type: AccountType) {
        const activeDrafts = await this.draftAccountRepository.getActiveDraftsOfType(type);
        if (activeDrafts.length > 0) {
            throw new Error('Draft account already exist');
        }

        const draftId = (new IdGenerator()).createUuid();
        const status = await this.draftAccountRepository.createNewDraftAccount(draftId, profileId, type);

        if (!status) {
            throw new Error('Cannot create draft account');
        }

        return draftId;
    }
}
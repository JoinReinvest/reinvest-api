import {CreateDraftAccount} from "LegalEntities/UseCases/CreateDraftAccount";
import {DraftAccountType} from "LegalEntities/Domain/DraftAccount/DraftAccount";
import {CompleteDraftAccount, IndividualDraftAccountInput} from "LegalEntities/UseCases/CompleteDraftAccount";
import {DraftAccountQuery, DraftQuery} from "LegalEntities/UseCases/DraftAccountQuery";

export class DraftAccountsController {
    public static getClassName = (): string => "DraftAccountsController";
    private createDraftAccountUseCase: CreateDraftAccount;
    private completeDraftAccount: CompleteDraftAccount;
    private draftAccountQuery: DraftAccountQuery;

    constructor(createDraftAccountUseCase: CreateDraftAccount, completeDraftAccount: CompleteDraftAccount, draftAccountQuery: DraftAccountQuery) {
        this.createDraftAccountUseCase = createDraftAccountUseCase;
        this.completeDraftAccount = completeDraftAccount;
        this.draftAccountQuery = draftAccountQuery;
    }

    public async createDraftAccount(profileId: string, type: DraftAccountType): Promise<{ id?: string, status: boolean, message?: string }> {
        try {
            const draftId = await this.createDraftAccountUseCase.execute(profileId, type);
            return {
                id: draftId,
                status: true
            }
        } catch (error) {
            return {
                status: false,
                message: `Draft account with type ${type} already exists`
            }
        }
    }

    public async readDraft(profileId: string, draftId: string, accountType: DraftAccountType): Promise<DraftQuery | null> {
        try {
            return await this.draftAccountQuery.getDraftDetails(profileId, draftId, accountType);
        } catch (error: any) {
            return null;
        }
    }

    public async completeIndividualDraftAccount(
        profileId: string,
        draftAccountId: string,
        individualInput: IndividualDraftAccountInput
    ): Promise<string[]> {
        try {
            return await this.completeDraftAccount.completeIndividual(profileId, draftAccountId, individualInput)
        } catch (error: any) {
            return [
                error.message
            ];
        }
    }
}
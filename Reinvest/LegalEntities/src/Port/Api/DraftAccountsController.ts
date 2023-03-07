import {IdGenerator} from "IdGenerator/IdGenerator";
import {CreateDraftAccount} from "LegalEntities/UseCases/CreateDraftAccount";
import {AccountType} from "LegalEntities/Domain/AccountType";

type NetRange = {
    from: string,
    to: string
}

type IndividualDraftAccountInput = {
    employmentStatus?: "EMPLOYED" | "UNEMPLOYED" | "RETIRED" | "STUDENT",
    employer?: {
        nameOfEmployer: string,
        occupation: string,
        industry: string
    },
    netWorth?: NetRange,
    netIncome?: NetRange
};

export class DraftAccountsController {
    public static getClassName = (): string => "DraftAccountsController";
    private createDraftAccountUseCase: CreateDraftAccount;

    constructor(createDraftAccountUseCase: CreateDraftAccount) {
        this.createDraftAccountUseCase = createDraftAccountUseCase;
    }

    public async createDraftAccount(profileId: string, type: AccountType): Promise<{ id?: string, status: boolean, message?: string }> {
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

    public async completeIndividualDraftAccount(
        profileId: string,
        draftAccountId: string,
        individualInput: IndividualDraftAccountInput
    ): Promise<{ id: string, type: AccountType }> {


        return {
            id: (new IdGenerator()).createUuid(),
            type: AccountType.INDIVIDUAL,
            ...individualInput
        }
    }
}
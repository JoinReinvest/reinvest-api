import {IdGenerator} from "IdGenerator/IdGenerator";

export type AccountType = "INDIVIDUAL" | "CORPORATE" | "TRUST"

type NetRange = {
    from: string,
    to: string
}

type IndividualDraftAccountInput = {
    experience?: "NO_EXPERIENCE" | "SOME_EXPERIENCE" | "VERY_EXPERIENCED" | "EXPERT",
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

    public async createDraftAccount(profileId: string, type: AccountType): Promise<{ id: string, type: AccountType }> {
        return {
            id: (new IdGenerator()).create(),
            type
        }
    }

    public async completeIndividualDraftAccount(
        profileId: string,
        draftAccountId: string,
        individualInput: IndividualDraftAccountInput
    ): Promise<{ id: string, type: AccountType }> {


        return {
            id: (new IdGenerator()).create(),
            type: "INDIVIDUAL",
            ...individualInput
        }
    }
}
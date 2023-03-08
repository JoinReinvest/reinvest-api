import {EmploymentStatus, EmploymentStatusInput} from "LegalEntities/Domain/DraftAccount/EmploymentStatus";
import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";

export enum DraftAccountState {
    ACTIVE = "ACTIVE",
    OPENED = "OPENED",
    CANCELED = "CANCELED"
}

export enum DraftAccountType {
    INDIVIDUAL = "INDIVIDUAL",
    CORPORATE = "CORPORATE",
    TRUST = "TRUST"
}

export type IndividualDraftAccountSchema = {
    employmentStatus: EmploymentStatusInput | null
    // employer?: {
    //     nameOfEmployer: string,
    //     occupation: string,
    //     industry: string
    // },
    // netWorth?: { range: string },
    // netIncome?: { range: string },
    // avatar?: { id: string },
    // isCompleted: boolean
}

export type DraftInput = {
    profileId: string,
    draftId: string,
    state: DraftAccountState,
    accountType: DraftAccountType,
    data: null | IndividualDraftAccountSchema
}


export abstract class DraftAccount {
    protected profileId: string;
    protected draftId: string;
    protected state: DraftAccountState;
    protected accountType: DraftAccountType;

    constructor(profileId: string, draftId: string, state: DraftAccountState, accountType: DraftAccountType) {
        this.draftId = draftId;
        this.state = state;
        this.profileId = profileId;
        this.accountType = accountType;
    }

    static create(draft: DraftInput): DraftAccount {
        const {profileId, draftId, state, accountType, data} = draft;
        switch (accountType) {
            case DraftAccountType.INDIVIDUAL:
                return IndividualDraftAccount.createIndividual(profileId, draftId, state, data as IndividualDraftAccountSchema);
            default:
                throw new Error('Draft type does not exist');
        }
    }

    protected get(value: ToObject | null) {
        if (value === null) {
            return null;
        }

        return value.toObject();
    }


    toObject(): DraftInput {
        return {
            profileId: this.profileId,
            draftId: this.draftId,
            state: this.state,
            accountType: this.accountType,
            data: null
        };
    }

    isIndividual(): boolean {
        return this.accountType === DraftAccountType.INDIVIDUAL
    }

    isCorporate(): boolean {
        return this.accountType === DraftAccountType.CORPORATE
    }

    isTrust(): boolean {
        return this.accountType === DraftAccountType.TRUST
    }

    isActive() {
        return this.state === DraftAccountState.ACTIVE;
    }

    isType(accountType: DraftAccountType) {
        return this.accountType === accountType;
    }
}


export class IndividualDraftAccount extends DraftAccount {
    private employmentStatus: EmploymentStatus | null = null;

    constructor(profileId: string, draftId: string, state: DraftAccountState) {
        super(profileId, draftId, state, DraftAccountType.INDIVIDUAL);
    }

    setEmploymentStatus(employmentStatus: EmploymentStatus) {
        this.employmentStatus = employmentStatus;
    }

    static createIndividual(profileId: string, draftId: string, state: DraftAccountState, data: IndividualDraftAccountSchema): IndividualDraftAccount {
        const draftAccount = new IndividualDraftAccount(profileId, draftId, state);
        if (!data) {
            return draftAccount;
        }

        if (data.employmentStatus) {
            draftAccount.setEmploymentStatus(EmploymentStatus.create(data.employmentStatus));
        }

        return draftAccount;
    }

    toObject(): DraftInput {
        return {
            ...super.toObject(),
            data: {
                employmentStatus: this.get(this.employmentStatus)
            }
        }
    }

    verifyCompletion() {
        return false;
    }
}
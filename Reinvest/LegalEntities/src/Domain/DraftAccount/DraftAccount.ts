import {EmploymentStatus, EmploymentStatusInput} from "LegalEntities/Domain/DraftAccount/EmploymentStatus";
import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";
import {Avatar, AvatarInput} from "LegalEntities/Domain/ValueObject/Document";
import {Employer, EmployerInput} from "LegalEntities/Domain/DraftAccount/Employer";
import {NetIncome, NetRangeInput, NetWorth} from "LegalEntities/Domain/DraftAccount/ValueRange";

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
    employmentStatus: EmploymentStatusInput | null,
    avatar: AvatarInput | null,
    employer: EmployerInput | null,
    netWorth: NetRangeInput | null,
    netIncome: NetRangeInput | null,
    isCompleted: boolean
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
    private avatar: Avatar | null = null;
    private employer: Employer | null = null;
    private netWorth: NetWorth | null = null;
    private netIncome: NetIncome | null = null;
    private isCompleted: boolean = false;

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

        if (data.avatar) {
            draftAccount.setAvatarDocument(Avatar.create(data.avatar));
        }

        if (data.employer) {
            draftAccount.setEmployer(Employer.create(data.employer));
        }

        if (data.netWorth) {
            draftAccount.setNetWorth(NetWorth.create(data.netWorth));
        }

        if (data.netIncome) {
            draftAccount.setNetIncome(NetIncome.create(data.netIncome));
        }

        if (data.isCompleted) {
            draftAccount.setAsCompleted();
        }

        return draftAccount;
    }

    toObject(): DraftInput {
        return {
            ...super.toObject(),
            data: {
                employmentStatus: this.get(this.employmentStatus),
                employer: this.get(this.employer),
                netWorth: this.get(this.netWorth),
                netIncome: this.get(this.netIncome),
                avatar: this.get(this.avatar),
                isCompleted: this.isCompleted
            }
        }
    }

    verifyCompletion() {
        const isAnyNull =
            this.employmentStatus === null ||
            this.employer === null ||
            this.netWorth === null ||
            this.netIncome === null;

        if (isAnyNull) {
            return false;
        }

        return true;
    }

    setAvatarDocument(avatar: Avatar) {
        this.avatar = avatar;
    }

    setEmployer(employer: Employer) {
        this.employer = employer;
    }

    setNetWorth(netWorth: NetWorth) {
        this.netWorth = netWorth;
    }

    setNetIncome(netIncome: NetIncome) {
        this.netIncome = netIncome;
    }

    setAsCompleted() {
        this.isCompleted = true;
    }
}
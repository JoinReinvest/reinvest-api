import {EmploymentStatus, EmploymentStatusInput} from "LegalEntities/Domain/ValueObject/EmploymentStatus";
import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";
import {Avatar, AvatarInput} from "LegalEntities/Domain/ValueObject/Document";
import {Employer, EmployerInput} from "LegalEntities/Domain/ValueObject/Employer";
import {NetIncome, ValueRangeInput, NetWorth} from "LegalEntities/Domain/ValueObject/ValueRange";

export type IndividualSchema = {
    accountId: string,
    profileId: string,
    employmentStatus: EmploymentStatusInput | null,
    employer: EmployerInput | null,
    netWorth: ValueRangeInput | null,
    netIncome: ValueRangeInput | null,
    avatar: AvatarInput | null,
}

export class IndividualAccount {
    private profileId: string;
    private accountId: string;
    private employmentStatus: EmploymentStatus | null = null;
    private employer: Employer | null = null;
    private netWorth: NetWorth | null = null;
    private netIncome: NetIncome | null = null;
    private avatar: Avatar | null = null;

    constructor(profileId: string, accountId: string) {
        this.profileId = profileId;
        this.accountId = accountId;
    }

    private get(value: ToObject | null) {
        if (value === null) {
            return null;
        }

        return value.toObject();
    }


    toObject(): IndividualSchema {
        return {
            accountId: this.accountId,
            profileId: this.profileId,
            employmentStatus: this.get(this.employmentStatus),
            employer: this.get(this.employer),
            netWorth: this.get(this.netWorth),
            netIncome: this.get(this.netIncome),
            avatar: this.get(this.avatar)
        };
    }

    static create(individualData: IndividualSchema): IndividualAccount {
        const {profileId, accountId, employmentStatus, employer, netIncome, netWorth, avatar} = individualData;
        const account = new IndividualAccount(profileId, accountId);

        if (employmentStatus) {
            account.setEmploymentStatus(EmploymentStatus.create(employmentStatus as EmploymentStatusInput));
        }

        if (avatar) {
            account.setAvatarDocument(Avatar.create(avatar as AvatarInput));
        }

        if (employer) {
            account.setEmployer(Employer.create(employer as EmployerInput));
        }

        if (netWorth) {
            account.setNetWorth(NetWorth.create(netWorth as ValueRangeInput));
        }

        if (netIncome) {
            account.setNetIncome(NetIncome.create(netIncome as ValueRangeInput));
        }

        return account;
    }

    setEmploymentStatus(employmentStatus: EmploymentStatus) {
        this.employmentStatus = employmentStatus;
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

    getInitials(): string {
        return "I";
    }
}
import {Id} from "LegalEntities/Domain/ValueObject/Id";
import {NonEmptyString, ValidationError, ValidationErrorEnum} from "LegalEntities/Domain/ValueObject/TypeValidators";
import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";
import {SensitiveNumberInput, SensitiveNumberSchema, SSN} from "LegalEntities/Domain/ValueObject/SensitiveNumber";

export type StakeholderSchema = {
    ssn: SensitiveNumberSchema | string;
}

export type StakeholderInput = StakeholderSchema & {
    ssn: { ssn: string }
}

export class Stakeholder implements ToObject {
    private ssn: SSN;

    constructor(ssn: SSN) {
        this.ssn = ssn;
    }

    isTheSameStakeholder(ssn: SSN): boolean {
        return this.getHashedSSN() === ssn.getHash();
    }

    getHashedSSN(): string {
        return this.ssn.getHash();
    }

    toObject(): StakeholderSchema {
        return {
            ssn: this.ssn.toObject(),
        };
    }

    getSSN(): SSN {
        return this.ssn;
    }

    static create(stakeholder: StakeholderSchema) {
        try {
            const {ssn} = stakeholder;

            const ssnObject = SSN.create(ssn)
            return new Stakeholder(ssnObject);
        } catch {
            throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, "stakeholder");
        }

    }
}


export class CompanyStakeholders implements ToObject {
    private stakeholders: Stakeholder[];

    constructor(stakeholders: Stakeholder[]) {
        this.stakeholders = stakeholders;
    }

    static create(data: StakeholderSchema[]): CompanyStakeholders {
        try {
            const stakeholders = data.map((stakeholder: StakeholderSchema) => Stakeholder.create(stakeholder));

            return new CompanyStakeholders(stakeholders);
        } catch (error: any) {
            throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, "stakeholders", error.message);
        }
    }

    toObject(): StakeholderSchema[] {
        return this.stakeholders.map((stakeholder: Stakeholder) => stakeholder.toObject());
    }

    addStakeholder(stakeholderToAdd: Stakeholder): void {
        const stakeholdersWithTheSameId = this.stakeholders.filter((stakeholder: Stakeholder) => stakeholder.isTheSameStakeholder(stakeholderToAdd.getSSN()));
        if (stakeholdersWithTheSameId.length === 0) {
            this.stakeholders.push(stakeholderToAdd);
        }
    }

    removeStakeholder(ssn: SSN): void {
        this.stakeholders = this.stakeholders.filter((doc: Stakeholder) => !doc.isTheSameStakeholder(ssn));
    }
}
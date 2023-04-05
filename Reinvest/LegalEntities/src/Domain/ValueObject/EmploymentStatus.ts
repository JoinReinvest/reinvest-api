import {ValidationError, ValidationErrorEnum} from "LegalEntities/Domain/ValueObject/TypeValidators";

export type EmploymentStatusInput = {
    status: EmploymentStatusEnum
}

export enum EmploymentStatusEnum {
    EMPLOYED = "EMPLOYED",
    UNEMPLOYED = "UNEMPLOYED",
    RETIRED = "RETIRED",
    STUDENT = "STUDENT",
}

export class EmploymentStatus {
    private employmentStatus: EmploymentStatusEnum;

    constructor(employmentStatus: EmploymentStatusEnum) {
        this.employmentStatus = employmentStatus;
    }

    static create(input: EmploymentStatusInput) {
        try {
            const {status} = input;
            if (!Object.values(EmploymentStatusEnum).includes(status)) {
                throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, "employmentStatus");
            }

            return new EmploymentStatus(status);
        } catch (error: any) {
            throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, "employmentStatus");
        }
    }

    toObject(): EmploymentStatusInput {
        return {
            status: this.employmentStatus
        }
    }
}
import {ValidationError} from "LegalEntities/Domain/ValueObject/TypeValidators";

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
                throw new ValidationError('WRONG_EMPLOYMENT_STATUS_TYPE')
            }

            return new EmploymentStatus(status);
        } catch (error) {
            throw new ValidationError('WRONG_EMPLOYMENT_STATUS_TYPE')
        }
    }

    toObject(): EmploymentStatusInput {
        return {
            status: this.employmentStatus
        }
    }
}
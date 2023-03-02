import {NonEmptyString, ValidationError} from "LegalEntities/Domain/ValueObject/TypeValidators";
import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";

export type SSNInput = string;

export class SSN extends NonEmptyString implements ToObject {
    constructor(value: string) {
        super(value, "SSN");
    }

    static create(ssn: SSNInput): SSN {
        try {
            return new SSN(ssn);
        } catch (error: any) {
            throw new ValidationError('Missing SSN value');
        }
    }

    toObject(): SSNInput {
        return this.value
    }
}

import {NonEmptyString, ValidationError} from "LegalEntities/Domain/ValueObject/TypeValidators";
import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";

export type SSNInput = {
    ssn: string
}

export class SSN extends NonEmptyString implements ToObject {
    constructor(value: string) {
        super(value, "SSN");
    }

    static create(data: SSNInput): SSN {
        try {
            const {ssn} = data;
            return new SSN(ssn);
        } catch (error: any) {
            throw new ValidationError('Missing SSN value');
        }
    }

    toObject(): SSNInput {
        return {
            ssn: this.value,
        }
    }
}

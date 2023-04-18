import {ValidationError, ValidationErrorEnum} from "LegalEntities/Domain/ValueObject/TypeValidators";

export type ValueStringInput = {
    value: string
}


export abstract class ValueString {
    private value: string;

    constructor(value: string) {
        this.value = value;
    }

    static getValidValue(valueStringInput: ValueStringInput, name: string): string {
        try {
            const {value} = valueStringInput;
            if (!value) {
                throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, name);
            }

            return value;
        } catch (error: any) {
            throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, name);
        }
    }

    toObject(): ValueStringInput {
        return {
            value: this.value
        }
    }
}

export class Industry extends ValueString {
    static create(valueStringInput: ValueStringInput): Industry {
        const value = ValueString.getValidValue(valueStringInput, 'industry');
        return new Industry(value);
    }
}

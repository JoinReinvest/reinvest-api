import {ValidationError, ValidationErrorEnum} from "LegalEntities/Domain/ValueObject/TypeValidators";

export type NetRangeInput = {
    range: string
}


export abstract class NetRange {
    private range: string;

    constructor(range: string) {
        this.range = range;
    }

    static getValidRange(netRangeInput: NetRangeInput, name: string): string {
        try {
            const {range} = netRangeInput;
            if (!range) {
                throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, name);
            }

            return range;
        } catch (error: any) {
            throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, name);
        }
    }

    toObject(): NetRangeInput {
        return {
            range: this.range
        }
    }
}

export class NetWorth extends NetRange {
    static create(netRangeInput: NetRangeInput): NetWorth {
        const range = NetRange.getValidRange(netRangeInput, 'netWorth');
        return new NetWorth(range);
    }
}

export class NetIncome extends NetRange {
    static create(netRangeInput: NetRangeInput): NetIncome {
        const range = NetRange.getValidRange(netRangeInput, 'netIncome');
        return new NetWorth(range);
    }
}
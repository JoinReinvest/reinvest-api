import {ValidationError} from "LegalEntities/Domain/ValueObject/TypeValidators";

export type NetRangeInput = {
    range: string
}


export abstract class NetRange {
    private range: string;

    constructor(range: string) {
        this.range = range;
    }

    static getValidRange(netRangeInput: NetRangeInput): string {
        const {range} = netRangeInput;
        if (!range) {
            throw new ValidationError("WRONG_NET_RANGE_TYPE")
        }

        return range;
    }

    toObject(): NetRangeInput {
        return {
            range: this.range
        }
    }
}

export class NetWorth extends NetRange {
    static create(netRangeInput: NetRangeInput): NetWorth {
        const range = NetRange.getValidRange(netRangeInput);
        return new NetWorth(range);
    }
}

export class NetIncome extends NetRange {
    static create(netRangeInput: NetRangeInput): NetIncome {
        const range = NetRange.getValidRange(netRangeInput);
        return new NetWorth(range);
    }
}
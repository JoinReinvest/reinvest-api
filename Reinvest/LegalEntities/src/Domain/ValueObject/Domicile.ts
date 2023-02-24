import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";
import {ValidationError} from "LegalEntities/Domain/ValueObject/TypeValidators";

export enum DomicileType {
    CITIZEN = "CITIZEN",
    GREEN_CARD = "GREEN_CARD",
    VISA = "VISA",
}

export type GreenCardInput = {
    birthCountry: string,
    citizenshipCountry: string,
}

export type VisaInput = {
    birthCountry: string,
    citizenshipCountry: string,
    visaType: string,
}

export type DomicileInput = {
    type: DomicileType,
    forGreenCard?: GreenCardInput,
    forVisa?: VisaInput
}

export abstract class Domicile implements ToObject {
    protected type: DomicileType;

    constructor(type: DomicileType) {
        this.type = type;
    }

    static create(domicile: DomicileInput): Domicile {
        const {type, forGreenCard, forVisa} = domicile;
        try {
            switch (type) {
                case DomicileType.CITIZEN:
                    return new USCitizen();
                case DomicileType.GREEN_CARD:
                    const {birthCountry, citizenshipCountry} = forGreenCard as GreenCardInput;
                    return new GreenCardResident(birthCountry, citizenshipCountry);
                case DomicileType.VISA:
                    const {birthCountry: birth, citizenshipCountry: citizenship, visaType} = forVisa as VisaInput;
                    return new VisaResident(birth, citizenship, visaType);
            }
        } catch (error: any) {
            throw new ValidationError('Missing domicile details');
        }
    }

    toObject(): any {
        throw new Error('Cannot use Domicile abstract class!');
    }
}

export class USCitizen extends Domicile implements ToObject {
    constructor() {
        super(DomicileType.CITIZEN);
    }

    toObject(): DomicileInput {
        return {
            type: this.type
        }
    }
}

export class GreenCardResident extends Domicile implements ToObject {
    private birthCountry: string;
    private citizenshipCountry: string;

    constructor(birthCountry: string, citizenshipCountry: string) {
        super(DomicileType.GREEN_CARD);
        this.birthCountry = birthCountry;
        this.citizenshipCountry = citizenshipCountry;
    }

    toObject(): DomicileInput {
        return {
            type: this.type,
            forGreenCard: {
                birthCountry: this.birthCountry,
                citizenshipCountry: this.citizenshipCountry
            }
        }
    }
}

export class VisaResident extends Domicile implements ToObject {
    private birthCountry: string;
    private citizenshipCountry: string;
    private visaType: string;

    constructor(birthCountry: string, citizenshipCountry: string, visaType: string) {
        super(DomicileType.VISA);
        this.birthCountry = birthCountry;
        this.citizenshipCountry = citizenshipCountry;
        this.visaType = visaType;
    }

    toObject(): DomicileInput {
        return {
            type: this.type,
            forVisa: {
                birthCountry: this.birthCountry,
                citizenshipCountry: this.citizenshipCountry,
                visaType: this.visaType
            }
        }
    }
}
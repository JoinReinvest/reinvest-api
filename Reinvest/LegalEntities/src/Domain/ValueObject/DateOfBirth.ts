import {IsoDate} from "LegalEntities/Domain/ValueObject/TypeValidators";
import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";

export type DateOfBirthInput = string;

export class DateOfBirth extends IsoDate implements ToObject {
    private date: string;

    constructor(date: string) {
        super(date);
        this.date = date;
    }

    static create(date: string): DateOfBirth {
        return new DateOfBirth(date);
    }

    toObject(): string {
        return this.date;
    }
}
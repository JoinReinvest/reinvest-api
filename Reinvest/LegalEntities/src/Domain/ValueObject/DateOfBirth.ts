import {IsoDate, ValidationError, ValidationErrorEnum} from "LegalEntities/Domain/ValueObject/TypeValidators";
import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";

export type DateOfBirthInput = {
    dateOfBirth: string
};

export class DateOfBirth extends IsoDate implements ToObject {
    private date: string;

    constructor(date: string) {
        super(date);
        this.date = date;
    }

    static create(date: DateOfBirthInput): DateOfBirth {
        if (!date) {
            throw new ValidationError(ValidationErrorEnum.EMPTY_VALUE, 'dateOfBirth');
        }
        const {dateOfBirth} = date;
        return new DateOfBirth(dateOfBirth);
    }

    toObject(): string {
        return this.date;
    }
}
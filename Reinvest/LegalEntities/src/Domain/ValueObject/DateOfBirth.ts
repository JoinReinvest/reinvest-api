import {IsoDate} from "LegalEntities/Domain/ValueObject/TypeValidators";

export type DateOfBirthInput = string;

export class DateOfBirth {
    static create(date: IsoDate): DateOfBirth {
        return new DateOfBirth();
    }
}
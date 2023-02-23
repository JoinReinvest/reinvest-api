import {AnyString, NonEmptyString} from "LegalEntities/Domain/ValueObject/TypeValidators";

export class FirstName extends NonEmptyString {
}

export class LastName extends NonEmptyString {
}

export class MiddleName extends AnyString {
}

export type PersonalNameInput = {
    firstName: string
    middleName?: string
    lastName: string,
}

export class PersonalName {
    private middleName: MiddleName;
    private firstName: FirstName;
    private lastName: LastName;

    // constructor(
    //     firstName: FirstName,
    //     lastName: LastName,
    //     middleName: MiddleName,
    // ) {
    //     this.lastName = lastName;
    //     this.firstName = firstName;
    //     this.middleName = middleName;
    // }

    static create(data: PersonalNameInput): PersonalName {
        return new PersonalName();
    }
}
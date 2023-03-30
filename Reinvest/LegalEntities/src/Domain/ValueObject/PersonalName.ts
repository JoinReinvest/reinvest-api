import {
    AnyString,
    NonEmptyString,
    ValidationError,
    ValidationErrorEnum
} from "LegalEntities/Domain/ValueObject/TypeValidators";
import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";

export class FirstName extends NonEmptyString {
    constructor(value: string) {
        super(value, "firstName");
    }
}

export class LastName extends NonEmptyString {
    constructor(value: string) {
        super(value, "lastName");
    }
}

export class MiddleName extends AnyString {
    constructor(value?: string) {
        super(value);
    }
}

export type PersonalNameInput = {
    firstName: string
    middleName?: string
    lastName: string,
}

export class PersonalName implements ToObject {
    private middleName: MiddleName;
    private firstName: FirstName;
    private lastName: LastName;

    constructor(
        firstName: FirstName,
        lastName: LastName,
        middleName: MiddleName,
    ) {
        this.lastName = lastName;
        this.firstName = firstName;
        this.middleName = middleName;
    }

    getLabel(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    static create(data: PersonalNameInput): PersonalName {
        try {
            const {firstName, lastName, middleName} = data;

            return new PersonalName(
                new FirstName(firstName),
                new LastName(lastName),
                new MiddleName(middleName)
            );
        } catch (error: any) {
            throw new ValidationError(ValidationErrorEnum.EMPTY_VALUE, 'name');
        }
    }

    toObject(): PersonalNameInput {
        return {
            'firstName': this.firstName.toString(),
            'lastName': this.lastName.toString(),
            'middleName': this.middleName.toString(),
        }
    }
}
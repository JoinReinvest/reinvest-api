import {AnyString, DateTime, Money, NonEmptyString} from "./TypeValidators";
import {Address, Domicile} from "./Address";
import {IdentityDocument} from "./Document";
import {Id, ProfileId} from "./Id";

export class FirstName extends NonEmptyString {
}

export class LastName extends NonEmptyString {
}

export class DateOfBirth extends DateTime {
}

export class SSN extends NonEmptyString {
}


export class Person {
    private firstName: FirstName;
    private lastName: LastName;
    private ssn: SSN;
    private domicile: Domicile;
    private address: Address;
    private dateOfBirth: DateOfBirth;
    private id: Id;
    private profileId: ProfileId;
    private identityDocument: IdentityDocument;

    constructor(id: Id,
                profileId: ProfileId,
                firstName: FirstName,
                lastName: LastName,
                ssn: SSN,
                domicile: Domicile,
                address: Address,
                dateOfBirth: DateOfBirth,
                identityDocument: IdentityDocument
    ) {
        this.id = id;
        this.profileId = profileId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.ssn = ssn;
        this.domicile = domicile;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
        this.identityDocument = identityDocument;
    }
}
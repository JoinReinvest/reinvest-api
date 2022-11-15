import {AnyString, Money} from "./ValueObject/TypeValidators";
import {Address, Domicile} from "./ValueObject/Address";
import {IdentityDocument} from "./ValueObject/Document";
import {Id, ProfileId} from "./ValueObject/Id";
import {DateOfBirth, FirstName, LastName, Person, SSN} from "./ValueObject/Person";

export class NetWorth extends Money {
}

export class NetIncome extends Money {
}


export class Employer extends AnyString {

}

export class Experience extends AnyString {

}

export class Individual extends Person {
    private employer: Employer;
    private experience: Experience;
    private netWorth: NetWorth;
    private netIncome: NetIncome;

    constructor(id: Id,
                profileId: ProfileId,
                firstName: FirstName,
                lastName: LastName,
                ssn: SSN,
                domicile: Domicile,
                address: Address,
                dateOfBirth: DateOfBirth,
                employer: Employer,
                experience: Experience,
                netWorth: NetWorth,
                netIncome: NetIncome,
                identityDocument: IdentityDocument
    ) {
        super(id, profileId, firstName, lastName, ssn, domicile, address, dateOfBirth, identityDocument);

        this.employer = employer;
        this.experience = experience;
        this.netWorth = netWorth;
        this.netIncome = netIncome;
    }
}
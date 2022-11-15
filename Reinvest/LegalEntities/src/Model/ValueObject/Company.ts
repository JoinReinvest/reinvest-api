import {NonEmptyString} from "./TypeValidators";
import {Address, Domicile} from "./Address";
import {Documents} from "./Document";
import {Person} from "./Person";
import {Id, ProfileId} from "./Id";


export class CompanyName extends NonEmptyString {

}

export class EIN extends NonEmptyString {

}

export class Persons {
    private persons: Person[];

    constructor(persons: Person[]) {
        this.persons = persons;
    }
}

export class Company {
    private id: Id;
    private profileId: ProfileId;
    private companyName: CompanyName;
    private ein: EIN;
    private domicile: Domicile;
    private address: Address;
    private documents: Documents;
    private persons: Persons;

    constructor(
        id: Id,
        profileId: ProfileId,
        companyName: CompanyName,
        ein: EIN,
        domicile: Domicile,
        address: Address,
        documents: Documents,
        persons: Persons
    ) {
        this.id = id;
        this.profileId = profileId;
        this.companyName = companyName;
        this.ein = ein;
        this.domicile = domicile;
        this.address = address;
        this.documents = documents;
        this.persons = persons;
    }
}
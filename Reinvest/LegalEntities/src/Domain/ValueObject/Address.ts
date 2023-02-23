import {
    NonEmptyString,
} from "LegalEntities/Domain/ValueObject/TypeValidators";


export type AddressInput = {
    addressLine1: string
    addressLine2?: string
    city: string
    zip: string
    country: string
    state: string
};

export class Street extends NonEmptyString {
}

export class City extends NonEmptyString {
}

export class State extends NonEmptyString {
}

export class ZipCode extends NonEmptyString {
}

export class Country extends NonEmptyString {
}

export class Address {
    private addressLine1: Street;
    private addressLine2: Street;
    private city: City;
    private state: State;
    private zipCode: ZipCode;
    private country: Country;

    // constructor(
    //     addressLine1: Street,
    //     addressLine2: Street,
    //     city: City,
    //     state: State,
    //     zipCode: ZipCode,
    //     country: Country
    // ) {
    //     this.addressLine1 = addressLine1;
    //     this.addressLine2 = addressLine2
    //     this.city = city;
    //     this.state = state;
    //     this.zipCode = zipCode;
    //     this.country = country;
    // }

    static create(data: AddressInput): Address {
        return new Address();
    }
}

import { AnyString, NonEmptyString, ValidationError, ValidationErrorEnum } from 'LegalEntities/Domain/ValueObject/TypeValidators';

import { ToObject } from './ToObject';

export type AddressInput = {
  addressLine1: string;
  city: string;
  country: string;
  state: string;
  zip: string;
  addressLine2?: string;
};

export class AddressLine1 extends NonEmptyString {
  constructor(value: string) {
    super(value, 'addressLine1');
  }
}

export class AddressLine2 extends AnyString {
  constructor(value?: string) {
    super(value);
  }
}

export class City extends NonEmptyString {
  constructor(value: string) {
    super(value, 'city');
  }
}

export class State extends NonEmptyString {
  constructor(value: string) {
    super(value, 'state');
  }
}

export class ZipCode extends NonEmptyString {
  constructor(value: string) {
    super(value, 'zipCode');
  }
}

export class Country extends NonEmptyString {
  constructor(value: string) {
    super(value, 'country');
  }
}

export class Address implements ToObject {
  private addressLine1: AddressLine1;
  private addressLine2: AddressLine2;
  private city: City;
  private state: State;
  private zipCode: ZipCode;
  private country: Country;

  constructor(addressLine1: AddressLine1, addressLine2: AddressLine2, city: City, state: State, zipCode: ZipCode, country: Country) {
    this.addressLine1 = addressLine1;
    this.addressLine2 = addressLine2;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
    this.country = country;
  }

  static create(data: AddressInput): Address {
    try {
      const { addressLine1, addressLine2, city, zip, country, state } = data;

      return new Address(
        new AddressLine1(addressLine1),
        new AddressLine2(addressLine2),
        new City(city),
        new State(state),
        new ZipCode(zip),
        new Country(country),
      );
    } catch (error: any) {
      throw new ValidationError(ValidationErrorEnum.MISSING_MANDATORY_FIELDS, 'address');
    }
  }

  toObject(): any {
    return {
      addressLine1: this.addressLine1.toString(),
      addressLine2: this.addressLine2.toString(),
      city: this.city.toString(),
      zip: this.zipCode.toString(),
      country: this.country.toString(),
      state: this.state.toString(),
    };
  }
}

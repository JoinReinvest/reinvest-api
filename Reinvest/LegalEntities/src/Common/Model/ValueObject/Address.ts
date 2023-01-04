import {
  AnyString,
  DateTime,
  EnumString,
  Money,
  NonEmptyString,
} from "./TypeValidators";

export class Street extends NonEmptyString {}

export class City extends NonEmptyString {}

export class State extends NonEmptyString {}

export class ZipCode extends NonEmptyString {}

export class Country extends NonEmptyString {}

export class Domicile extends EnumString {}

export class Address {
  private street: Street;
  private city: City;
  private state: State;
  private zipCode: ZipCode;
  private country: Country;

  constructor(
    street: Street,
    city: City,
    state: State,
    zipCode: ZipCode,
    country: Country
  ) {
    this.street = street;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
    this.country = country;
  }
}

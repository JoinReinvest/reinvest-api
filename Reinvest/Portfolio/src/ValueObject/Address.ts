export type AddressInput = {
  address_1: string;
  address_2: string;
  city: string;
  postal_code: string;
};

export class AddressLine {
  private value: string;

  constructor(value: string) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}

export class City {
  private value: string;

  constructor(value: string) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}

export class Zip {
  private value: string;

  constructor(value: string) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}

export class Address {
  private address_1: AddressLine;
  private address_2: AddressLine;
  private city: City;
  private postal_code: Zip;

  constructor(address_1: AddressLine, address_2: AddressLine, city: City, postal_code: Zip) {
    this.address_1 = address_1;
    this.address_2 = address_2;
    this.city = city;
    this.postal_code = postal_code;
  }

  static create(data: AddressInput): Address {
    const { address_1, address_2, city, postal_code } = data;

    return new Address(new AddressLine(address_1), new AddressLine(address_2), new City(city), new Zip(postal_code));
  }

  toObject() {
    return {
      address_1: this.address_1.getValue(),
      address_2: this.address_2.getValue(),
      city: this.city.getValue(),
      postal_code: this.postal_code.getValue(),
    };
  }
}

import { UUID } from 'HKEKTypes/Generics';

import { Address } from '../ValueObject/Address';
import { Location } from '../ValueObject/Location';

export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVE = 'ARCHIVE',
}

export type PropertyData = {
  address: {
    address_1: string;
    address_2: string;
    city: string;
    postal_code: string;
  };
  id: number;
  location: {
    lat: string;
    lng: string;
  };
  name: string;
};

export type DealpathJson = PropertyData;

export type AdminJson = any;

export type PropertySchema = {
  adminJson: AdminJson;
  dataJson: PropertyData;
  dealpathJson: DealpathJson;
  id: number;
  lastUpdate: Date;
  portfolioId: UUID;
  status: PropertyStatus;
};

export class Property {
  private id: number;
  private portfolioId: UUID;
  private lastUpdate: Date;
  private status: PropertyStatus;
  private address: Address | null = null;
  private location: Location | null = null;
  private name: string | null = null;

  constructor(id: number, portfolioId: UUID, status: PropertyStatus, lastUpdate: Date) {
    this.id = id;
    this.portfolioId = portfolioId;
    this.status = status;
    this.lastUpdate = lastUpdate;
  }

  static create(propertySchema: PropertySchema) {
    const { id, portfolioId, status, lastUpdate, dataJson } = propertySchema;

    const property = new Property(id, portfolioId, status, lastUpdate);

    if (dataJson.address) {
      const { address_1, address_2, postal_code, city } = dataJson.address;

      property.setAddress(Address.create({ address_1, address_2, postal_code, city }));
    }

    if (dataJson.address) {
      const { lat, lng } = dataJson.location;

      property.setLocation(Location.create({ lat, lng }));
    }

    if (dataJson.name) {
      property.setName(dataJson.name);
    }

    return property;
  }

  getId() {
    return this.id;
  }

  setName(name: string) {
    this.name = name;
  }

  setAddress(address: Address) {
    this.address = address;
  }

  setLocation(location: Location) {
    this.location = location;
  }

  archive() {
    this.status = PropertyStatus.ARCHIVE;
  }

  toObject() {
    const dealpathJson = {
      name: this.name,
      address: this.address,
      location: this.location?.toObject(),
      id: this.id,
    };

    const adminJson = {};

    return {
      id: this.id,
      portfolioId: this.portfolioId,
      lastUpdate: this.lastUpdate,
      status: this.status,
      dealpathJson,
      adminJson,
      dataJson: {
        ...adminJson,
        ...dealpathJson,
      },
    };
  }
}

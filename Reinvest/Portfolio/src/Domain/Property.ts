import { UUID } from 'HKEKTypes/Generics';

import {
  ImpactMetrics,
  KeyMetrics,
  POI,
  PropertyAddress,
  PropertyAdminData,
  PropertyDealpathData,
  PropertyImage,
  PropertyLocation,
  PropertyStatus,
} from './types';

export type PropertySchema = {
  id: number;
  lastUpdate: Date;
  portfolioId: UUID;
  status: PropertyStatus;
  adminJson?: PropertyAdminData;
  dealpathJson?: PropertyDealpathData;
};

export class Property {
  private id: number;
  private portfolioId: UUID;
  private lastUpdate: Date;
  private status: PropertyStatus;
  private dealpathJson: PropertyDealpathData | Record<string, never> = {};
  private adminJson: PropertyAdminData | Record<string, never> = {};

  constructor(id: number, portfolioId: UUID, status: PropertyStatus, lastUpdate: Date) {
    this.id = id;
    this.portfolioId = portfolioId;
    this.status = status;
    this.lastUpdate = lastUpdate;
  }

  static create(propertySchema: PropertySchema) {
    const { id, portfolioId, status, lastUpdate, dealpathJson, adminJson } = propertySchema;

    const property = new Property(id, portfolioId, status, lastUpdate);

    if (dealpathJson) {
      property.setDealpathJson(dealpathJson);
    }

    if (adminJson) {
      property.setAdminJson(adminJson);
    }

    return property;
  }

  getId() {
    return this.id;
  }

  setAdminJson(adminJson: PropertyAdminData) {
    this.adminJson = adminJson;
  }

  setDealpathJson(dealpathJson: PropertyDealpathData) {
    this.dealpathJson = dealpathJson;
  }

  setNameAsDealpath(name: string) {
    this.dealpathJson.name = name;
  }

  setNameAsAdmin(name: string) {
    this.adminJson.name = name;
  }

  setAddressAsDealpath(address: PropertyAddress) {
    this.dealpathJson.address = address;
  }

  setAddressAsAdmin(address: PropertyAddress) {
    this.adminJson.address = address;
  }

  setLocationAsDealpath(location: PropertyLocation) {
    this.dealpathJson.location = location;
  }

  setLocationAsAdmin(location: PropertyLocation) {
    this.adminJson.location = location;
  }

  setKeyMetricsAsAdmin(keyMetrics: KeyMetrics) {
    this.adminJson.keyMetrics = keyMetrics;
  }

  setImpactMetricsAsAdmin(impactMetrics: ImpactMetrics) {
    this.adminJson.impactMetrics = impactMetrics;
  }

  setImageAsAdmin(image: PropertyImage) {
    this.adminJson.image = image;
  }

  replaceImageAsAdmin(image: PropertyImage) {
    if (this.adminJson.image !== null && this.adminJson.image?.id !== image.id) {
      const { id, path } = image;

      const event = {
        kind: 'PropertyImageRemoved',
        id,
        data: {
          path,
        },
      };
      this.adminJson.image = image;

      return event;
    }

    this.adminJson.image = image;

    return null;
  }

  addGalleryImageAsAdmin(image: PropertyImage) {
    if (!this.adminJson.gallery) {
      this.adminJson.gallery = [];
    }

    const imageAlreadyAdded = this.adminJson.gallery?.find(el => el.id === image.id);

    if (!imageAlreadyAdded) {
      this.adminJson.gallery?.push(image);
    }
  }

  addPOIAsAdmin(poi: POI) {
    if (!this.adminJson.POIs) {
      this.adminJson.POIs = [];
    }

    this.adminJson.POIs?.push(poi);
  }

  archive() {
    this.status = PropertyStatus.ARCHIVE;
  }

  toObject() {
    const dealpathJson = {
      name: this.dealpathJson.name,
      address: this.dealpathJson.address,
      location: this.dealpathJson.location,
    };

    const adminJson = {
      keyMetrics: this.adminJson.keyMetrics,
      impactMetrics: this.adminJson.impactMetrics,
      gallery: this.adminJson.gallery,
      image: this.adminJson.image,
      POIs: this.adminJson.POIs,
    };

    return {
      id: this.id,
      portfolioId: this.portfolioId,
      lastUpdate: this.lastUpdate,
      status: this.status,
      dealpathJson,
      adminJson,
      dataJson: {
        ...dealpathJson,
        ...adminJson,
      },
    };
  }

  getAdminJson(): PropertyAdminData {
    return this.adminJson;
  }
}

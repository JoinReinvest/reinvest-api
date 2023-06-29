import { UUID } from 'HKEKTypes/Generics';
import { Address } from 'Portfolio/ValueObject/Address';
import { Image } from 'Portfolio/ValueObject/Image';
import { ImpactMetrics, ImpactMetricsInput } from 'Portfolio/ValueObject/ImpactMetrics';
import { KeyMetrics, KeyMetricsInput } from 'Portfolio/ValueObject/KeyMetrics';
import { Location } from 'Portfolio/ValueObject/Location';
import { POI, POIInput } from 'Portfolio/ValueObject/POI';

export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVE = 'ARCHIVE',
}

export type PropertyDealpathData = {
  id: number;
  address?: {
    address_1: string;
    address_2: string;
    city: string;
    postal_code: string;
  };
  location?: {
    lat: string;
    lng: string;
  };
  name?: string;
};

export type PropertyAdminData = {
  POIs?: POIInput[];
  gallery?: string[];
  image?: string;
  impactMetrics?: ImpactMetricsInput;
  keyMetrics?: KeyMetricsInput;
};
export type DealpathJson = PropertyDealpathData;

export type DataJson = DealpathJson & PropertyAdminData;

export type PropertySchema = {
  dataJson: DataJson;
  dealpathJson: DealpathJson;
  id: number;
  lastUpdate: Date;
  portfolioId: UUID;
  status: PropertyStatus;
  adminJson?: DataJson;
};

export class Property {
  private id: number;
  private portfolioId: UUID;
  private lastUpdate: Date;
  private status: PropertyStatus;
  private address: Address | null = null;
  private location: Location | null = null;
  private name: string | null = null;
  private keyMetrics: KeyMetrics | null = null;
  private impactMetrics: ImpactMetrics | null = null;
  private image: Image | null = null;
  private gallery: Image[] | null = null;
  private POIs: POI[] | null = null;
  private asAdmin: boolean = false;

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

    if (dataJson.location) {
      const { lat, lng } = dataJson.location;

      property.setLocation(Location.create({ lat, lng }));
    }

    if (dataJson.name) {
      property.setName(dataJson.name);
    }

    if (dataJson.keyMetrics) {
      property.setKeyMetrics(KeyMetrics.create(dataJson.keyMetrics));
    }

    if (dataJson.impactMetrics) {
      property.setImpactMetrics(ImpactMetrics.create(dataJson.impactMetrics));
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

  setKeyMetrics(keyMetrics: KeyMetrics) {
    this.keyMetrics = keyMetrics;
  }

  setImpactMetrics(impactMetrics: ImpactMetrics) {
    this.impactMetrics = impactMetrics;
  }

  setImage(image: Image) {
    this.image = image;
  }

  replaceImage(image: Image) {
    if (this.image !== null && !this.image.isTheSame(image)) {
      const { id, path } = image.toObject();

      const event = {
        kind: 'PropertyImageRemoved',
        id,
        data: {
          path,
        },
      };
      this.image = image;

      return event;
    }

    this.image = image;

    return null;
  }

  addGalleryImage(image: Image) {
    const imageAlreadyAdded = this.gallery?.find(el => el.toObject().id === image.toObject().id);

    if (!imageAlreadyAdded) {
      this.gallery?.push(image);
    }
  }

  addPOI(poi: POI) {
    this.POIs?.push(poi);
  }

  archive() {
    this.status = PropertyStatus.ARCHIVE;
  }

  saveAsAdmin() {
    this.asAdmin = true;
  }

  toObject() {
    let adminJson;
    let dealpathJson;

    if (!this.asAdmin) {
      dealpathJson = {
        name: this.name,
        address: this.address,
        location: this.location?.toObject(),
        id: this.id,
      };
    }

    if (this.asAdmin) {
      adminJson = {
        name: this.name,
        address: this.address?.toObject(),
        location: this.location?.toObject(),
        keyMetrics: this.keyMetrics?.toObject(),
        impactMetrics: this.impactMetrics?.toObject(),
        id: this.id,
        gallery: this.gallery?.map(img => img.toObject()),
        image: this.image?.toObject(),
        POIs: this.POIs?.map(poi => poi.toObject()),
      };
    }

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
}

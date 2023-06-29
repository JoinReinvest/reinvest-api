export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVE = 'ARCHIVE',
}

export type PropertyAddress = {
  address_1: string;
  address_2: string;
  city: string;
  postal_code: string;
};

export type PropertyLocation = {
  lat: string;
  lng: string;
};

export type PropertyDealpathData = {
  id: number;
  address?: PropertyAddress;
  location?: PropertyLocation;
  name?: string;
};

export type ImpactMetrics = {
  jobsCreated: string;
  totalProjectSize: string;
  units: string;
};

export type KeyMetrics = {
  projectReturn: string;
  rating: string;
  structure: string;
};

export type POI = {
  description: string;
  image: string;
  name: string;
  path: string;
};

export type PropertyImage = {
  id: string;
  path: string;
};

export type PropertyAdminData = {
  POIs?: POI[];
  address?: PropertyAddress;
  gallery?: PropertyImage[];
  image?: PropertyImage;
  impactMetrics?: ImpactMetrics;
  keyMetrics?: KeyMetrics;
  location?: PropertyLocation;
  name?: string;
};

export type DataJson = PropertyDealpathData & PropertyAdminData;

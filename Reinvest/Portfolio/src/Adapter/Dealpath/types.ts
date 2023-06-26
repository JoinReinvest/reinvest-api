import type { PropertyData } from 'Portfolio/Domain/Property';

export type GetPropertyResponse = {
  property: {
    data: PropertyData;
  };
};

export type GetPropertiesResponse = {
  properties: {
    data: PropertyData[];
  };
};

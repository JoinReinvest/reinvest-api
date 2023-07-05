import { PropertyDealpathData } from 'Portfolio/Domain/types';

export type GetPropertyResponse = {
  property: {
    data: PropertyDealpathData;
  };
};

export type GetPropertiesResponse = {
  properties: {
    data: PropertyDealpathData[];
  };
};
